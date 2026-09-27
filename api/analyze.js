const MODEL = "gemini-3.8-flash";

const SYSTEM_PROMPT = `
Tu es ACCESS PATH 🇸🇳, un assistant IA sénégalais spécialisé dans
les démarches administratives et l'accessibilité numérique.

MISSION :
Aider simplement les citoyens à comprendre leurs démarches.

Tu peux expliquer :
- carte nationale d'identité
- passeport
- casier judiciaire
- certificat de nationalité
- certificat de résidence
- état civil
- documents judiciaires
- documents administratifs
- procédures et formulaires

POUR CHAQUE DEMARCHE, SI L'INFORMATION EST DISPONIBLE :
📋 Documents à fournir
📍 Où effectuer la démarche
💰 Coût
⏳ Délai
🪜 Étapes
⚠️ Cas particuliers
🔗 Source officielle

RÈGLES :
1. Utilise un français simple et accessible.
2. Si l'utilisateur demande l'anglais, réponds en anglais.
3. Si l'utilisateur demande le wolof, réponds en wolof autant que possible.
4. Ne jamais inventer un prix, délai, adresse ou document.
5. Si une information n'est pas certaine, dire clairement :
   "Information à vérifier auprès du service compétent."
6. Pour les informations administratives, privilégier les sources
   officielles sénégalaises.
7. Si la question concerne une situation personnelle
   (perte, renouvellement, mineur, étranger, etc.),
   demander les informations nécessaires avant de conclure.
8. Ne demande jamais de numéro CNI réel, mot de passe,
   données bancaires ou autre donnée sensible inutile.
9. Ne prétends jamais effectuer une démarche à la place du citoyen.
10. Si l'utilisateur fournit un document, analyse-le simplement.
11. Explique les termes administratifs difficiles.
12. Pour les personnes ayant des difficultés de lecture,
    utilise des phrases courtes et des étapes numérotées.

IMPORTANT :
Les informations administratives peuvent changer.
Indique toujours que l'utilisateur doit vérifier la source officielle
avant de se déplacer lorsque le tarif, le délai ou les conditions
peuvent évoluer.
`;

module.exports = async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Méthode non autorisée"
    });
  }

  try {

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Clé Gemini absente"
      });
    }

    const body = req.body || {};

    /* =====================================================
       CHAT
    ===================================================== */

    if (body.action === "chat") {

      const question = String(body.question || "").trim();

      if (!question) {
        return res.status(400).json({
          success: false,
          error: "Question vide"
        });
      }

      const history = Array.isArray(body.history)
        ? body.history.slice(-12)
        : [];

      const contents = [];

      for (const item of history) {

        if (!item || !item.text) continue;

        contents.push({
          role: item.role === "assistant"
            ? "model"
            : "user",

          parts: [
            {
              text: String(item.text)
            }
          ]
        });

      }

      contents.push({
        role: "user",
        parts: [
          {
            text: question
          }
        ]
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },

          body: JSON.stringify({

            system_instruction: {
              parts: [
                {
                  text: SYSTEM_PROMPT
                }
              ]
            },

            contents,

            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1500
            }

          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        return res.status(response.status).json({
          success: false,
          error:
            data?.error?.message ||
            "Erreur Gemini"
        });

      }

      const answer =
        data?.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("")
          .trim();

      if (!answer) {

        return res.status(500).json({
          success: false,
          error: "Réponse Gemini vide"
        });

      }

      return res.status(200).json({
        success: true,
        answer
      });
    }


    /* =====================================================
       ANALYSE DOCUMENT
    ===================================================== */

    const mimeType = body.mimeType;
    const base64 = body.data;
    const fileName = body.fileName || "document";

    if (!mimeType || !base64) {

      return res.status(400).json({
        success: false,
        error: "Document manquant"
      });

    }

    const prompt = `
Analyse ce document pour ACCESS PATH.

Réponds UNIQUEMENT avec ce JSON :

{
  "title": "",
  "summary": "",
  "documents": [],
  "steps": [],
  "warnings": [],
  "accessibility": ""
}

Consignes :

- français simple
- ne rien inventer
- résumer le document
- identifier les documents demandés
- identifier les actions
- identifier les dates
- identifier les montants
- identifier les informations importantes
- signaler les éléments difficiles à comprendre
- décrire les éléments visuels importants
- expliquer le document pour une personne ayant des difficultés de lecture

Nom du fichier :
${fileName}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({

          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64
                  }
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }

        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "Erreur Gemini"
      });

    }

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {

      return res.status(500).json({
        success: false,
        error: "Analyse vide"
      });

    }

    let analysis;

    try {

      analysis = JSON.parse(raw);

    } catch {

      analysis = {
        title: "Document analysé",
        summary: raw,
        documents: [],
        steps: [],
        warnings: [],
        accessibility: raw
      };

    }

    return res.status(200).json({
      success: true,
      analysis
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });

  }

};
