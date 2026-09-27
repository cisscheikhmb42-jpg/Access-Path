const MODEL = "gemini-3.8-flash";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    const { mimeType, data, fileName } = req.body || {};

    if (!mimeType || !data) {
      return res.status(400).json({
        error: "Aucun document reçu."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Clé Gemini non configurée sur le serveur."
      });
    }

    const prompt = `
Tu es ACCESS PATH, un assistant d'accessibilité numérique.

Analyse le document fourni et transforme son contenu en informations simples,
claires et accessibles à une personne qui peut avoir des difficultés à comprendre
des documents administratifs complexes.

Réponds UNIQUEMENT avec un objet JSON valide ayant exactement cette structure :

{
  "title": "Titre ou type du document",
  "summary": "Explication simple du document en quelques phrases",
  "documents": [
    "Document ou information nécessaire 1",
    "Document ou information nécessaire 2"
  ],
  "steps": [
    "Étape 1",
    "Étape 2",
    "Étape 3"
  ],
  "warnings": [
    "Point important à vérifier 1",
    "Point important à vérifier 2"
  ],
  "accessibility": "Conseil d'accessibilité ou explication supplémentaire"
}

Règles :
- Réponds en français simple.
- N'invente aucune information absente du document.
- Identifie les actions que l'utilisateur doit réellement effectuer.
- Explique les termes administratifs difficiles avec des mots simples.
- Si le document contient une date limite, indique-la clairement.
- Si le document contient des montants, conserve-les exactement.
- Si le document contient des éléments visuels importants, décris-les simplement.
- Si une information n'est pas disponible, indique-le clairement.
- Le résultat doit être utile à une personne ayant des difficultés de lecture,
  de compréhension ou d'accès à l'information.

Nom du fichier : ${fileName || "document"}
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
                  inlineData: {
                    mimeType: mimeType,
                    data: data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", result);

      return res.status(response.status).json({
        error: "Erreur lors de l'analyse Gemini.",
        details: result?.error?.message || "Erreur inconnue"
      });
    }

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini n'a retourné aucun résultat."
      });
    }

    let analysis;

    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = {
        title: "Analyse du document",
        summary: text,
        documents: [],
        steps: [],
        warnings: [],
        accessibility: ""
      };
    }

    return res.status(200).json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Une erreur interne est survenue.",
      details: error.message
    });
  }
}
