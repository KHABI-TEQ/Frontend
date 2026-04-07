/** @format */

/** Strip trailing "(required: …)" etc. for shorter labels. */
export function fieldPromptLabel(field: string): string {
  return field.replace(/\s*\([^)]*\)\s*$/g, "").trim() || field;
}

function preferenceSample(focusLower: string): string {
  const f = focusLower;
  if (f.includes("preference type")) return "buy";
  if (f.includes("preference location — state")) return "Lagos";
  if (f.includes("preference location — lga")) return "Ikeja";
  if (f.includes("preference location — area")) return "Lekki Phase 1";
  if (f.includes("location state") || (f.includes("state") && f.includes("location"))) return "Lagos";
  if (f.includes("lga") || f.includes("area name") || f.includes("at least one lga")) return "Ikeja";
  if (f.includes("custom location")) return "e.g. Banana Island";
  if (f.includes("min price")) return "15000000";
  if (f.includes("max price") && f.includes("greater")) return "50000000";
  if (f.includes("max price")) return "50000000";
  if (f.includes("min price")) return "10000000";
  if (f.includes("full name") && !f.includes("contact person")) return "Jane Doe";
  if (f.includes("contact person")) return "Jane Doe";
  if (f.includes("company name")) return "Acme Developers Ltd";
  if (f.includes("email")) return "you@example.com";
  if (f.includes("phone")) return "08012345678";
  if (f.includes("check-in")) return "2025-08-01";
  if (f.includes("check-out")) return "2025-08-10";
  if (f.includes("guests")) return "4";
  if (f.includes("travel type")) return "family";
  if (f.includes("bedroom")) return "3";
  if (f.includes("bathroom")) return "2";
  if (f.includes("property type")) return "residential";
  if (f.includes("building type")) return "duplex";
  if (f.includes("property condition")) return "new";
  if (f.includes("document type") || f.includes("document")) return "C of O";
  if (f.includes("lease term")) return "1 Year";
  if (f.includes("landmark")) return "near Shoprite";
  if (f.includes("notes") || f.includes("special requirements")) return "need borehole";
  if (f.includes("features") || f.includes("amenities")) return "parking, security";
  if (f.includes("jv type")) return "Equity Split";
  if (f.includes("development type")) return "Mini flats";
  if (f.includes("sharing")) return "60-40";
  if (f.includes("title")) return "C of O";
  if (f.includes("land size") && f.includes("jv")) return "500";
  if (f.includes("measurement unit")) return "plot";
  return "…";
}

function pickVariant<T>(choices: T[], variant: number): T {
  return choices[Math.abs(variant) % choices.length] ?? choices[0];
}

/**
 * One display line with (format: sample) and a separate speak line (no format clause, no emoji).
 */
export function getPreferenceFieldPrompt(
  focus: string,
  variant: number,
): { displayLine: string; speakLine: string } {
  const f = focus.toLowerCase();
  const sample = preferenceSample(f);
  const lab = fieldPromptLabel(focus);

  if (f.includes("preference type")) {
    const speak = pickVariant(
      [
        "Which are you looking for: buy, rent, shortlet, or joint venture?",
        "Is this a buy, rent, shortlet, or joint venture preference?",
        "What type of preference is this: buy, rent, shortlet, or joint venture?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("preference location — state") || f === "preference location — state (required)") {
    const speak = pickVariant(
      ["Which state?", "What state is the property in?", "Name the state."],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("preference location — lga")) {
    const speak = pickVariant(
      [
        "Which local government area?",
        "What is the local government?",
        "Name the LGA.",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("preference location — area")) {
    const speak = pickVariant(
      ["Which area or neighbourhood?", "What specific area?", "Name the neighbourhood or zone."],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("location state") || (f.includes("state") && f.includes("required") && f.includes("location"))) {
    const speak = pickVariant(
      ["Which state?", "What state?", "Which Nigerian state should it be in?"],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("at least one lga") || (f.includes("lga") && f.includes("area")) || f.includes("lga or area name")) {
    const speak = pickVariant(
      ["Which LGA or area?", "What local government or area?", "Name an LGA or area."],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("area name") || f.includes("custom location")) {
    const speak = pickVariant(["Which area or custom location?", "What area are you targeting?", "Name the area."], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("min price")) {
    const speak = pickVariant(["What's your minimum budget in Naira?", "Minimum price in Naira?", "How much is your budget floor?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("max price must")) {
    const speak = pickVariant(["Max price must be higher than min — what max in Naira?", "Enter a maximum above your minimum.", "What maximum budget in Naira?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("max price")) {
    const speak = pickVariant(["What's your maximum budget in Naira?", "Maximum price in Naira?", "Top of your budget in Naira?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("company name")) {
    const speak = pickVariant(["What's the company name?", "Company legal name?", "Which company is this for?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("contact person")) {
    const speak = pickVariant(["Who is the contact person?", "Contact person's full name?", "Name of your representative?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("full name") && !f.includes("contact person")) {
    const speak = pickVariant(["What's your full name?", "Your name?", "How should we address you?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("email")) {
    const speak = pickVariant(["What's your email?", "Your email address?", "Best email to reach you?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("phone")) {
    const speak = pickVariant(["What's your phone number?", "A phone we can call?", "Your mobile number?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("contact email or phone")) {
    const speak = pickVariant(["Share an email or phone number.", "What's your email or phone?", "How can we contact you?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("check-in")) {
    const speak = pickVariant(["Check-in date?", "When do you want to check in?", "Arrival date?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("check-out")) {
    const speak = pickVariant(["Check-out date?", "Departure date?", "When are you leaving?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("guests")) {
    const speak = pickVariant(["How many guests?", "Number of guests?", "Headcount?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("travel type")) {
    const speak = pickVariant(["Travel type?", "Solo, family, business?", "Who is traveling?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bedroom")) {
    const speak = pickVariant(["How many bedrooms?", "Bedroom count?", "Minimum bedrooms?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bathroom")) {
    const speak = pickVariant(["How many bathrooms?", "Bathroom count?", "Bathrooms needed?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("property type")) {
    const speak = pickVariant(["Which property type?", "What type of property?", "Land, residential, or commercial?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("building type")) {
    const speak = pickVariant(["What type of building?", "Detached, duplex, flat?", "Building type?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("property condition")) {
    const speak = pickVariant(["What condition?", "New, renovated, or used?", "Property condition?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("document type") || (f.includes("document") && f.includes("least"))) {
    const speak = pickVariant(["Which documents do you need?", "Title documents?", "List document types."], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("lease term")) {
    const speak = pickVariant(["Preferred lease term?", "Six months or one year?", "Lease length?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("landmark")) {
    const speak = pickVariant(["Any nearby landmark?", "Landmark nearby?", "What's nearby?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("features") || f.includes("amenities")) {
    const speak = pickVariant(["Which features matter?", "Key amenities?", "List must-have features."], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("additional notes") || f.includes("special requirements")) {
    const speak = pickVariant(["Any extra notes?", "Special requirements?", "Anything else to add?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("land size") && f.includes("jv")) {
    const speak = pickVariant(["Land size amount?", "How large is the plot?", "Land size number?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("measurement unit")) {
    const speak = pickVariant(["Measurement unit?", "Plot, square metres, or hectares?", "Unit for land size?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("jv type")) {
    const speak = pickVariant(["Which JV type?", "Equity split, lease-to-build, or development partner?", "JV structure?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("development type")) {
    const speak = pickVariant(["What are you developing?", "Development types?", "Types of units?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("preferred sharing") || f.includes("sharing ratio")) {
    const speak = pickVariant(["Preferred profit split?", "Sharing ratio?", "Example sixty-forty?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("minimum title")) {
    const speak = pickVariant(["Minimum title requirements?", "Which titles must the land have?", "Title documents required?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  const speak = pickVariant(
    [
      `What ${lab}?`,
      `Which ${lab}?`,
      `Tell me the ${lab}.`,
      `Could you share ${lab}?`,
    ],
    variant,
  );
  return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
}

function propertySample(focusLower: string): string {
  const f = focusLower;
  if (f.includes("property type") && f.includes("sale")) return "sale";
  if (f.includes("category")) return "Residential";
  if (f.includes("location") && f.includes("state")) return "Lagos, Lekki, Ikeja";
  if (f.includes("lga") || f.includes("local government")) return "Ikeja";
  if (f.includes("price")) return "85000000";
  if (f.includes("description")) return "3-bed with BQ";
  if (f.includes("bedroom")) return "3";
  if (f.includes("bathroom") && f.includes("toilet")) return "3 baths, 3 toilets";
  if (f.includes("bathroom")) return "3";
  if (f.includes("toilet")) return "3";
  if (f.includes("condition")) return "new";
  if (f.includes("building")) return "duplex";
  if (f.includes("parking")) return "2";
  if (f.includes("document") || f.includes("title")) return "C of O";
  if (f.includes("measurement type")) return "Square Meter";
  if (f.includes("land size")) return "450";
  if (f.includes("features")) return "generator, water";
  return "…";
}

export function getPropertyFieldPrompt(
  focus: string,
  variant: number,
): { displayLine: string; speakLine: string } {
  const f = focus.toLowerCase();
  const sample = propertySample(f);
  const lab = fieldPromptLabel(focus);

  if (f.includes("property type") && f.includes("sale")) {
    const speak = pickVariant(["Sale, rent, shortlet, or joint venture?", "Listing type?", "Is this sale, rent, shortlet, or JV?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("category")) {
    const speak = pickVariant(["Residential, commercial, or land?", "Property category?", "Which category?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("location") && f.includes("state")) {
    const speak = pickVariant(["State, area, and LGA?", "Full location?", "Where is it located?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("lga") || f.includes("local government")) {
    const speak = pickVariant(["Which LGA?", "Local government area?", "LGA name?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("price")) {
    const speak = pickVariant(["Price in Naira?", "Asking price?", "How much?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("description")) {
    const speak = pickVariant(["Short description?", "Describe the property.", "One-line summary?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bathroom") && f.includes("toilet")) {
    const speak = pickVariant(["How many bathrooms and toilets?", "Bath and toilet counts?", "Bathrooms and toilets?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bathroom")) {
    const speak = pickVariant(["How many bathrooms?", "Bathroom count?", "Bathrooms?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("toilet")) {
    const speak = pickVariant(["How many toilets?", "Toilet count?", "Toilets?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bedroom")) {
    const speak = pickVariant(["How many bedrooms?", "Bedroom count?", "Bedrooms?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("condition")) {
    const speak = pickVariant(["Property condition?", "New or used?", "Condition?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("building")) {
    const speak = pickVariant(["Type of building?", "Flat or duplex?", "Building type?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("parking")) {
    const speak = pickVariant(["Parking spaces?", "How many car parks?", "Parking?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("document") || f.includes("title")) {
    const speak = pickVariant(["Which title documents?", "Documents on the property?", "List documents."], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("measurement type")) {
    const speak = pickVariant(["Land measured in what unit?", "Measurement type?", "Plot or square metres?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("land size")) {
    const speak = pickVariant(["Land size number?", "Size of the land?", "Numeric land size?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("features")) {
    const speak = pickVariant(["Key features?", "List main features.", "What features?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  const speak = pickVariant([`What ${lab}?`, `Which ${lab}?`, `Tell me the ${lab}.`, `Could you share ${lab}?`], variant);
  return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
}

export function preferenceAllDonePrompt(): { displayLine: string; speakLine: string } {
  return {
    displayLine: 'All set. Tap "I\'m done — confirm contact" to type your name and email.',
    speakLine: "All set. Tap I'm done, confirm contact, to type your name and email.",
  };
}

export function propertyAllDonePrompt(): { displayLine: string; speakLine: string } {
  return {
    displayLine: 'All set. Tap "I\'m done" for the summary.',
    speakLine: "All set. Tap I'm done for the summary.",
  };
}
