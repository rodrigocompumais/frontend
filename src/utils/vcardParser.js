/**
 * Parse vCard format string into structured contact data
 * @param {string} vcardString - The vCard string to parse
 * @returns {Object} Parsed contact data
 */
export const parseVCard = (vcardString) => {
  if (!vcardString || typeof vcardString !== 'string') {
    return null;
  }

  const lines = vcardString.split(/\r?\n/);
  const contact = {
    name: '',
    firstName: '',
    lastName: '',
    phones: [],
    emails: [],
    organization: '',
    photo: null,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle multi-line values (lines starting with space or tab)
    if (line.startsWith(' ') || line.startsWith('\t')) {
      // This is a continuation of the previous line
      continue;
    }

    // Split by colon, but handle escaped colons
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const keyOriginal = line.substring(0, colonIndex).trim();
    const key = keyOriginal.toUpperCase();
    const value = line.substring(colonIndex + 1).trim();

    // Parse N (Name) field: LastName;FirstName;MiddleName;Prefix;Suffix
    if (key === 'N' || key.startsWith('N;')) {
      const nameParts = value.split(';');
      if (nameParts.length >= 2) {
        contact.lastName = nameParts[0] || '';
        contact.firstName = nameParts[1] || '';
        contact.name = `${contact.firstName} ${contact.lastName}`.trim() || contact.name;
      }
    }

    // Parse FN (Full Name) field
    if (key === 'FN' || key.startsWith('FN;')) {
      contact.name = value || contact.name;
    }

    // Parse TEL (Telephone) fields
    // Handle formats like: item1.TEL;waid=553488913278:+55 34 8891-3278
    if (key.includes('TEL')) {
      // Extract phone number from various formats
      let phoneNumber = value;
      let phoneType = '';
      
      // Handle waid parameter: item1.TEL;waid=553488913278:+55 34 8891-3278
      // Use original key (case-sensitive) to find waid
      if (keyOriginal.includes('waid=')) {
        const waidMatch = keyOriginal.match(/waid=([^:;]+)/i);
        if (waidMatch) {
          phoneNumber = waidMatch[1];
        }
      }
      
      // Extract label from key (e.g., item1.X-ABLabel:Celular)
      // We'll look for it in the next lines if needed
      
      // Clean phone number - keep + and digits
      phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      // Determine phone type from key or label
      if (key.includes('CELL') || key.includes('MOBILE') || keyOriginal.includes('Celular')) {
        phoneType = 'Celular';
      } else if (key.includes('WORK') || keyOriginal.includes('Trabalho')) {
        phoneType = 'Trabalho';
      } else if (key.includes('HOME') || keyOriginal.includes('Casa')) {
        phoneType = 'Casa';
      } else {
        phoneType = 'Telefone';
      }
      
      if (phoneNumber) {
        contact.phones.push({
          number: phoneNumber,
          type: phoneType
        });
      }
    }
    
    // Parse X-ABLabel (label for phone/email) - usually comes after TEL
    // Check in next line for label (item1.X-ABLabel:Celular)
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.includes('X-ABLabel') || nextLine.includes('LABEL')) {
        const nextColonIndex = nextLine.indexOf(':');
        if (nextColonIndex !== -1) {
          const labelValue = nextLine.substring(nextColonIndex + 1).trim();
          if (contact.phones.length > 0 && labelValue) {
            contact.phones[contact.phones.length - 1].type = labelValue;
          }
        }
      }
    }
    
    // Also check current line for label
    if (key.includes('X-ABLABEL') || key.includes('LABEL')) {
      if (contact.phones.length > 0) {
        contact.phones[contact.phones.length - 1].type = value || contact.phones[contact.phones.length - 1].type;
      }
    }

    // Parse EMAIL fields
    if (key.includes('EMAIL')) {
      if (value && value.includes('@')) {
        contact.emails.push(value);
      }
    }

    // Parse ORG (Organization) field
    if (key === 'ORG' || key.startsWith('ORG;')) {
      contact.organization = value || '';
    }

    // Parse PHOTO field (usually base64 or URL)
    if (key === 'PHOTO' || key.startsWith('PHOTO;')) {
      if (value.startsWith('data:') || value.startsWith('http')) {
        contact.photo = value;
      } else if (value.length > 100) {
        // Likely base64 encoded
        contact.photo = `data:image/jpeg;base64,${value}`;
      }
    }
  }

  // If no name was found, try to extract from FN or use first phone number
  if (!contact.name) {
    // Try to find name in the original string
    const fnMatch = vcardString.match(/FN:([^\r\n]+)/i);
    if (fnMatch) {
      contact.name = fnMatch[1].trim();
    } else if (contact.phones.length > 0) {
      contact.name = contact.phones[0].number;
    } else {
      contact.name = 'Contato';
    }
  }

  return contact;
};

/**
 * Check if a string is a vCard format
 * @param {string} text - Text to check
 * @returns {boolean}
 */
export const isVCard = (text) => {
  if (!text || typeof text !== 'string') return false;
  return text.trim().toUpperCase().startsWith('BEGIN:VCARD') && 
         text.toUpperCase().includes('END:VCARD');
};
