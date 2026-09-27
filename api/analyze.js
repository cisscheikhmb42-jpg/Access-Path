// ============================================================
// ACCESS PATH — AI ADMINISTRATIVE ASSISTANT FOR SENEGAL
// API V2 — Gemini
// ============================================================

const MODEL = "gemini-3.8-flash";

// ------------------------------------------------------------
// CORS
// ------------------------------------------------------------

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ------------------------------------------------------------
// BASE ADMINISTRATIVE SÉNÉGAL
// IMPORTANT : ne jamais inventer un prix/délai.
// "À vérifier" signifie que nous n'avons pas une donnée
// officielle suffisamment claire.
// ------------------------------------------------------------

const PROCEDURES = [

  {
    id: "cni",
    keywords: [
      "cni",
      "carte nationale",
      "carte identité",
      "carte d'identité",
      "identité",
      "pièce identité",
      "perdu ma carte",
      "perte carte"
    ],
    name: "Carte nationale d'identité biométrique",
    category: "Identité",
    officialSource:
      "https://interieur.gouv.sn/services/services-aux-usagers/carte-nationale-d-identite-biometrique",

    facts: {
      eligible:
        "Tout citoyen sénégalais âgé d'au moins 5 ans peut demander une CNI.",

      documents: [
        "L'ancienne carte nationale d'identité numérisée",
        "OU un extrait de naissance datant de moins de 3 mois"
      ],

      places: [
        "Commissariat de police dont relève le domicile",
        "Brigade de gendarmerie dont relève le domicile",
        "Préfecture ou sous-préfecture dont relève le domicile"
      ],

      cost:
        "Pour une demande ordinaire, vérifier les conditions et éventuels frais au lieu de dépôt. En cas de perte, le Ministère de l'Intérieur indique notamment une déclaration de perte et un timbre fiscal de 10 000 FCFA.",

      delay:
        "Non précisé clairement sur la fiche officielle consultée.",

      validity:
        "La CNI est valable 10 ans.",

      lost:
        "En cas de perte, une déclaration de perte est nécessaire. La procédure officielle prévoit notamment un timbre fiscal de 10 000 FCFA et un extrait de naissance de moins de 3 mois.",

      steps: [
        "Préparer les pièces nécessaires.",
        "Se rendre au lieu de dépôt compétent selon le domicile.",
        "Déposer la demande.",
        "Conserver le récépissé ou justificatif remis.",
        "Suivre les indications données pour le retrait."
      ]
    }
  },

  {
    id: "passport",
    keywords: [
      "passeport",
      "passport",
      "voyage",
      "partir à l'étranger",
      "document voyage"
    ],
    name: "Passeport ordinaire",
    category: "Voyage",

    officialSource:
      "https://www.interieur.gouv.sn/services/services-aux-usagers/passeport-ordinaire",

    facts: {
      eligible:
        "Tout citoyen sénégalais peut demander un passeport ordinaire dès la naissance.",

      documents: [
        "Original de la carte nationale d'identité",
        "Copie certifiée conforme de la carte nationale d'identité",
        "3 photos d'identité en couleur",
        "Quittance attestant du paiement de la somme due"
      ],

      cost: "20 000 FCFA",

      delay: "2 semaines",

      place:
        "Commissariat de police dont relève le domicile.",

      dakar:
        "À Dakar, le demandeur doit se présenter au commissariat sur rendez-vous.",

      validity:
        "Le passeport est valable 4 ans.",

      lost:
        "En cas de perte ou de vol, il faut faire une déclaration de perte puis refaire la procédure. Aucun duplicata n'est délivré.",

      steps: [
        "Préparer l'original et la copie certifiée conforme de la CNI.",
        "Préparer les 3 photos d'identité en couleur.",
        "Effectuer le paiement requis.",
        "Se rendre au commissariat compétent.",
        "Déposer le dossier.",
        "Attendre la délivrance du passeport."
      ]
    }
  },

  {
    id: "casier",
    keywords: [
      "casier",
      "casier judiciaire",
      "bulletin 3",
      "bulletin numéro 3",
      "casier judiciaire bulletin"
    ],
    name: "Casier judiciaire — Bulletin n°3",
    category: "Justice",

    officialSource:
      "https://justice.sec.gouv.sn/services-aux-usagers/casier-judiciaire/",

    facts: {
      eligible:
        "Le bulletin n°3 est délivré notamment à toute personne née au Sénégal, au Sénégalais né à l'étranger et à l'étranger résidant au Sénégal.",

      documents: [
        "Acte de naissance",
        "OU copie certifiée conforme de la carte nationale d'identité"
      ],

      placeSenegal:
        "Greffe du tribunal de grande instance du lieu de naissance pour une personne née au Sénégal.",

      placeForeignBirth:
        "Greffe de la Cour d'Appel de Dakar pour un Sénégalais né à l'étranger ou un étranger résidant au Sénégal.",

      cost: "200 FCFA",

      delay: "1 jour",

      steps: [
        "Préparer l'acte de naissance ou la copie certifiée conforme de la CNI.",
        "Se rendre au greffe compétent.",
        "Déposer la demande.",
        "Payer les frais de délivrance.",
        "Retirer le bulletin selon les indications du service."
      ]
    }
  },

  {
    id: "nationalite",
    keywords: [
      "nationalité",
      "nationalite",
      "certificat nationalité",
      "certificat de nationalité",
      "devenir sénégalais",
      "naturalisation"
    ],
    name: "Nationalité sénégalaise",
    category: "Justice",

    officialSource:
      "https://justice.sec.gouv.sn/services-aux-usagers/nationalite/",

    facts: {
      information:
        "Les procédures de nationalité dépendent de la situation de la personne : filiation, mariage, naturalisation ou autre situation prévue par la législation.",

      documents:
        "Les pièces dépendent de la procédure concernée. Il faut identifier la situation exacte avant de donner une liste définitive.",

      place:
        "Les démarches sont traitées par les autorités judiciaires compétentes selon la procédure.",

      cost:
        "Variable selon la procédure. Ne pas inventer un montant sans identifier la procédure.",

      delay:
        "Variable selon la procédure.",

      steps: [
        "Identifier le fondement de la demande de nationalité.",
        "Identifier les pièces correspondant à cette situation.",
        "Déposer la demande auprès du service compétent.",
        "Suivre la procédure indiquée par l'administration."
      ]
    }
  },

  {
    id: "residence",
    keywords: [
      "résidence",
      "residence",
      "certificat résidence",
      "certificat de résidence",
      "justificatif domicile",
      "domicile"
    ],
    name: "Certificat de résidence",
    category: "État civil / Administration",

    officialSource:
      "https://bo.senegalservices.sn/demarches/citoyennete-justice-et-securite/etat-civil",

    facts: {
      information:
        "Le certificat de résidence sert notamment à justifier le lieu de résidence. Les modalités exactes peuvent dépendre de l'autorité compétente et de la situation du demandeur.",

      documents:
        "Une pièce d'identité et les justificatifs demandés par le service compétent peuvent être nécessaires.",

      place:
        "Vérifier auprès de l'autorité administrative compétente du lieu de résidence.",

      cost:
        "À vérifier selon le service et la démarche concernée.",

      delay:
        "À vérifier.",

      steps: [
        "Identifier l'autorité compétente pour votre lieu de résidence.",
        "Préparer votre pièce d'identité et les justificatifs demandés.",
        "Déposer la demande.",
        "Retirer le certificat selon les indications du service."
      ]
    }
  },

  {
    id: "etranger",
    keywords: [
      "étranger",
      "etranger",
      "carte étranger",
      "carte d'étranger",
      "titre séjour",
      "séjour sénégal",
      "résidence étranger"
    ],
    name: "Carte d'identité d'étranger",
    category: "Séjour / Immigration",

    officialSource:
      "https://www.interieur.gouv.sn/services/services-aux-usagers/carte-d-identite-d-etranger",

    facts: {
      documents: [
        "Demande manuscrite adressée au Ministre de l'Intérieur",
        "Copies des cinq premières pages du passeport",
        "Casier judiciaire du pays d'origine datant de moins de 3 mois",
        "Extrait de naissance datant de moins de 6 mois",
        "Certificat médical datant de moins de 3 mois",
        "Documents professionnels ou scolaires selon la situation",
        "3 photos d'identité",
        "Timbre fiscal de 15 000 FCFA",
        "Justificatif concernant le cautionnement de rapatriement selon la nationalité"
      ],

      place:
        "Direction de la Police des Étrangers et des Titres de Voyage (DPETV).",

      cost:
        "15 000 FCFA de timbre fiscal, auxquels peuvent s'ajouter les éléments prévus selon la situation, notamment le cautionnement de rapatriement.",

      delay:
        "Non précisé clairement sur la fiche officielle consultée."
    }
  },

  {
    id: "birth",
    keywords: [
      "naissance",
      "acte naissance",
      "acte de naissance",
      "extrait naissance",
      "extrait de naissance",
      "bulletin naissance"
    ],
    name: "Acte / extrait de naissance",
    category: "État civil",

    officialSource:
      "https://bo.senegalservices.sn/demarches/citoyennete-justice-et-securite/etat-civil",

    facts: {
      information:
        "Les services d'état civil comprennent notamment les actes et extraits relatifs à la naissance.",

      documents:
        "Les pièces nécessaires dépendent du type exact de document demandé et de la situation.",

      place:
        "Service d'état civil compétent.",

      cost:
        "À vérifier selon le document demandé.",

      delay:
        "À vérifier.",

      steps: [
        "Identifier le document exact : copie, extrait ou bulletin.",
        "Identifier le service d'état civil compétent.",
        "Préparer les informations ou pièces nécessaires.",
        "Déposer la demande et suivre les instructions du service."
      ]
    }
  }
];

// ------------------------------------------------------------
// NORMALISATION DU TEXTE
// ------------------------------------------------------------

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ------------------------------------------------------------
// DÉTECTION DE LA PROCÉDURE
// ------------------------------------------------------------

function detectProcedures(question) {

  const q = normalize(question);

  const scored = PROCEDURES.map((procedure) => {

    let score = 0;

    for (const keyword of procedure.keywords) {

      const k = normalize(keyword);

      if (q.includes(k)) {
        score += k.length >= 8 ? 4 : 2;
      }
    }

    return {
      procedure,
      score
    };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.procedure);
}

// ------------------------------------------------------------
// TRANSFORME LA BASE EN CONTEXTE POUR GEMINI
// ------------------------------------------------------------

function buildAdministrativeContext(question) {

  const detected = detectProcedures(question);

  // Si une procédure est détectée,
  // on donne en priorité les données correspondantes.
  if (detected.length > 0) {

    return detected.map(p => ({
      nom: p.name,
      categorie: p.category,
      source_officielle: p.officialSource,
      informations: p.facts
    }));
  }

  // Sinon, on donne une vue globale légère.
  return PROCEDURES.map(p => ({
    nom: p.name,
    categorie: p.category,
    source_officielle: p.officialSource,
    mots_cles: p.keywords
  }));
}

// ------------------------------------------------------------
// SYSTEM PROMPT — LE "CERVEAU" D'ACCESS PATH
// ------------------------------------------------------------

const SYSTEM_PROMPT = `
Tu es ACCESS PATH.

ACCESS PATH est un assistant administratif intelligent conçu pour les citoyens
du Sénégal.

TON COMPORTEMENT DOIT RESSEMBLER À CELUI D'UN TRÈS BON ASSISTANT HUMAIN :
- naturel
- chaleureux
- précis
- simple
- pédagogique
- conversationnel
- jamais robotique
- jamais inutilement compliqué.

Tu réponds principalement en français.

Si l'utilisateur écrit en anglais, réponds en anglais.

Si l'utilisateur écrit en wolof, comprends autant que possible sa demande
et réponds en wolof lorsque tu peux le faire correctement. Sinon, réponds
en français simple en indiquant brièvement que tu peux continuer en français.

============================================================
MISSION
============================================================

Ton rôle est d'aider une personne à comprendre une démarche administrative
au Sénégal.

L'utilisateur peut parler de façon très naturelle.

Exemples :

"je veux faire mon passeport"

"j'ai perdu ma carte"

"ana laa def ngir am casier judiciaire ?"

"combien coûte le passeport ?"

"je suis à Thiès et je dois avoir un casier"

"il me faut un papier pour prouver que je suis célibataire"

"what documents do I need for a passport?"

Tu dois comprendre l'intention même si l'utilisateur n'utilise pas le
terme administratif exact.

============================================================
RÈGLE ABSOLUE : NE PAS INVENTER
============================================================

Tu disposes d'une base administrative fournie dans le contexte.

Quand une information est présente dans cette base, utilise-la.

Quand une information n'est PAS présente ou n'est pas suffisamment certaine :

NE L'INVENTE PAS.

Dis :
"Cette information doit être vérifiée auprès du service compétent."

Tu ne dois jamais inventer :
- un prix
- un délai
- une adresse
- un numéro de téléphone
- un document obligatoire
- une procédure
- un lien officiel.

============================================================
STYLE DE RÉPONSE
============================================================

Réponds comme ChatGPT : avec une vraie conversation.

Ne commence pas systématiquement par :
"Selon les informations..."

Évite les réponses froides.

Privilégie :

"Oui, bien sûr."

"Dans votre situation..."

"Voici ce qu'il faut préparer."

"Si vous êtes à Thiès, le point important est..."

Quand la question est simple, réponds simplement.

Quand la question demande une démarche, structure la réponse avec :

📄 Documents à préparer
📍 Où faire la démarche
💰 Coût
⏳ Délai
🪜 Étapes
⚠️ À savoir
🔗 Source officielle

N'affiche que les sections pertinentes.

============================================================
QUESTIONS DE CLARIFICATION
============================================================

Si la situation dépend d'une information manquante,
pose UNE question de clarification avant de donner une réponse trop précise.

Exemple :

Utilisateur :
"Je veux obtenir la nationalité."

Bonne réponse :
"Bien sûr. Pour vous guider correctement, j'ai besoin de savoir :
vous êtes né au Sénégal, vous avez un parent sénégalais, vous êtes marié(e)
à un(e) Sénégalais(e), ou vous souhaitez demander la nationalité par
naturalisation ?"

Ne pose pas de question inutile si tu peux déjà répondre.

============================================================
LOCALISATION
============================================================

Si l'utilisateur donne une ville :
- tiens compte de cette ville ;
- ne prétends pas connaître une adresse précise si elle n'est pas dans
la base ;
- indique le service compétent ;
- si l'adresse exacte n'est pas connue, dis-le.

Exemple :

"Je suis à Thiès."

Tu peux répondre :
"À Thiès, vous devez vous adresser au service compétent correspondant
à votre domicile. La source officielle indique..."

Ne fabrique jamais un commissariat ou une adresse.

============================================================
SITUATIONS PARTICULIÈRES
============================================================

Si l'utilisateur dit :
"j'ai perdu..."
"on m'a volé..."
"je suis mineur..."
"je suis étranger..."
"je suis né à l'étranger..."
"je suis à Dakar..."
"je suis à Thiès..."

adapte la réponse.

============================================================
SÉCURITÉ ET DONNÉES PERSONNELLES
============================================================

Ne demande jamais à l'utilisateur :
- son numéro de CNI
- son numéro de passeport
- son mot de passe
- ses coordonnées bancaires
- une photo réelle de sa pièce d'identité
- des données personnelles inutiles.

Si l'utilisateur envoie un document contenant des données sensibles,
conseille-lui de ne pas partager plus d'informations personnelles que
nécessaire.

============================================================
IMPORTANT
============================================================

ACCESS PATH ne remplace pas l'administration.

Pour une information importante, encourage l'utilisateur à vérifier
la source officielle fournie.

Ne prétends jamais avoir effectué une démarche à la place de l'utilisateur.

Tu guides.

Tu expliques.

Tu simplifies.

Tu aides la personne à savoir quoi faire ensuite.

============================================================
FORMAT
============================================================

Utilise des paragraphes courts.

Utilise des listes quand elles améliorent la compréhension.

Ne donne pas une énorme réponse si la question est simple.

À la fin, lorsque c'est pertinent, propose une aide concrète :

"Si vous me dites votre ville et votre situation, je peux vous expliquer
les étapes une par une."

Ne répète pas cette phrase systématiquement.
`;

// ------------------------------------------------------------
// APPEL GEMINI
// ------------------------------------------------------------

async function callGemini(contents, config = {}) {

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY manquante dans Vercel.");
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const body = {
    systemInstruction: {
      parts: [
        {
          text: SYSTEM_PROMPT
        }
      ]
    },

    contents,

    generationConfig: {
      maxOutputTokens: 1800,
      responseMimeType: "text/plain"
    },

    ...config
  };

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },

    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {

    console.error("Gemini API error:", data);

    throw new Error(
      data?.error?.message ||
      `Gemini API error ${response.status}`
    );
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

  if (!text) {
    throw new Error("Gemini n'a retourné aucune réponse.");
  }

  return text;
}

// ------------------------------------------------------------
// HISTORIQUE PROPRE
// ------------------------------------------------------------

function cleanHistory(history) {

  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-12)
    .filter(item =>
      item &&
      typeof item.text === "string" &&
      item.text.trim()
    )
    .map(item => {

      const role =
        item.role === "assistant" ||
        item.role === "model"
          ? "model"
          : "user";

      return {
        role,
        parts: [
          {
            text: item.text.slice(0, 6000)
          }
        ]
      };
    });
}

// ------------------------------------------------------------
// DOCUMENT ANALYSIS
// ------------------------------------------------------------

async function analyzeDocument({
  mimeType,
  data,
  fileName
}) {

  if (!mimeType || !data) {
    throw new Error("Document incomplet.");
  }

  const documentPrompt = `
Analyse ce document pour ACCESS PATH.

Objectif :
aider un citoyen à comprendre un document administratif ou numérique.

Retourne uniquement un JSON valide avec cette structure :

{
  "title": "",
  "summary": "",
  "documents": [],
  "steps": [],
  "warnings": [],
  "accessibility": ""
}

Règles :

- Ne fabrique aucune information absente du document.
- Si quelque chose n'est pas lisible, indique-le.
- Explique avec un langage simple.
- Si le document contient des informations personnelles,
  ne les répète pas inutilement.
- "documents" = pièces ou justificatifs mentionnés dans le document.
- "steps" = actions que la personne doit comprendre ou effectuer.
- "warnings" = éléments importants à vérifier.
- "accessibility" = description simple des éléments visuels utiles.
`;

  const contents = [
    {
      role: "user",

      parts: [
        {
          text: documentPrompt
        },

        {
          inline_data: {
            mime_type: mimeType,
            data
          }
        }
      ]
    }
  ];

  const result = await callGemini(contents, {
    responseMimeType: "application/json"
  });

  let parsed;

  try {
    parsed = JSON.parse(result);
  } catch {

    const cleaned = result
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(
        "Impossible de lire la réponse d'analyse du document."
      );
    }
  }

  return {
    ...parsed,
    fileName: fileName || "document"
  };
}

// ------------------------------------------------------------
// HANDLER VERCEL
// ------------------------------------------------------------

module.exports = async (req, res) => {

  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Méthode non autorisée."
    });
  }

  try {

    const body = req.body || {};

    const action = body.action || "chat";

    // ========================================================
    // CHAT
    // ========================================================

    if (action === "chat") {

      const question =
        typeof body.question === "string"
          ? body.question.trim()
          : "";

      if (!question) {
        return res.status(400).json({
          success: false,
          error: "Veuillez écrire votre question."
        });
      }

      if (question.length > 10000) {
        return res.status(400).json({
          success: false,
          error: "Question trop longue."
        });
      }

      const history = cleanHistory(body.history);

      const relevantProcedures =
        buildAdministrativeContext(question);

      const administrativeContext = JSON.stringify(
        relevantProcedures,
        null,
        2
      );

      const contextMessage = `
CONTEXTE ADMINISTRATIF DISPONIBLE POUR CETTE QUESTION

Utilise ce contexte comme source prioritaire.

${administrativeContext}

FIN DU CONTEXTE ADMINISTRATIF

QUESTION ACTUELLE DE L'UTILISATEUR :

${question}

Réponds maintenant directement à l'utilisateur.
`;

      const contents = [
        ...history,

        {
          role: "user",

          parts: [
            {
              text: contextMessage
            }
          ]
        }
      ];

      const answer = await callGemini(contents);

      return res.status(200).json({
        success: true,
        answer,
        detectedProcedures:
          detectProcedures(question).map(p => ({
            id: p.id,
            name: p.name,
            source: p.officialSource
          }))
      });
    }

    // ========================================================
    // DOCUMENT
    // ========================================================

    if (action === "document") {

      const result = await analyzeDocument({
        mimeType: body.mimeType,
        data: body.data,
        fileName: body.fileName
      });

      return res.status(200).json({
        success: true,
        analysis: result
      });
    }

    return res.status(400).json({
      success: false,
      error: "Action inconnue."
    });

  } catch (error) {

    console.error("ACCESS PATH ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Une erreur est survenue. Veuillez réessayer."
    });
  }
};
