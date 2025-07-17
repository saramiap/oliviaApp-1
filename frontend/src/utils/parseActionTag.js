// src/utils/parseActionTag.js

/**
 * Extrait un tag d'action et ses paramètres depuis un texte.
 * Exemple : "Voici un conseil #SUGGESTION_JOURNAL{prompt:\"Parle de ta journée\"}"
 * => { displayText, actionName, params }
 */
export const parseActionTag = (textWithTag) => {
  if (!textWithTag || typeof textWithTag !== "string") {
    return { displayText: "", actionName: null, params: {} };
  }

  const tagRegex = /#([A-Z_]+)\{([^}]*)\}/;
  const match = textWithTag.match(tagRegex);

  if (match) {
    const actionName = match[1];
    const paramsString = match[2];
    let params = {};

    const paramRegex = /(\w+)\s*:\s*"([^"]*)"/g;
    let paramMatch;
    while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
      params[paramMatch[1]] = paramMatch[2];
    }

    const displayText = textWithTag.replace(tagRegex, "").trim();

    return { displayText, actionName, params };
  }

  return { displayText: textWithTag, actionName: null, params: {} };
};
