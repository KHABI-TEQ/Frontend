/** @format */

/** Strip trailing "(required: …)" etc. for shorter labels. */
export function fieldPromptLabel(field: string): string {
  return field.replace(/\s*\([^)]*\)\s*$/g, "").trim() || field;
}

function preferenceSample(focusLower: string): string {
  const f = focusLower.toLowerCase().replace(/\u2013|\u2014/g, "-");
  if (f.includes("preference type")) return "Buy";
  if (f.includes("expected completion date")) return "2027-06-30";
  if (f.includes("development stage") && f.includes("off-plan")) return "Foundation Stage";
  if (f.includes("payment plan") && f.includes("off-plan")) return "12 Months Installment";
  if (f.includes("preference location - state")) return "Lagos";
  if (f.includes("preference location - lga")) return "Ikeja";
  if (f.includes("preference location - area")) return "Lekki Phase 1";
  if (f.includes("location state") || (f.includes("state") && f.includes("location"))) return "Lagos";
  if (f.includes("lga") || f.includes("area name") || f.includes("at least one lga")) return "Ikeja";
  if (f.includes("custom location")) return "e.g. Banana Island";
  if (f.includes("min price")) return "15,000,000";
  if (f.includes("max price") && f.includes("greater")) return "50,000,000";
  if (f.includes("max price")) return "50,000,000";
  if (f.includes("min price")) return "10,000,000";
  if (f.includes("full name") && !f.includes("contact person")) return "Jane Doe";
  if (f.includes("contact person")) return "Jane Doe";
  if (f.includes("company name")) return "Acme Developers Ltd";
  if (f.includes("email")) return "you@example.com";
  if (f.includes("phone")) return "08012345678";
  if (f.includes("check-in")) return "2025-08-01";
  if (f.includes("check-out")) return "2025-08-10";
  if (f.includes("maximum guests")) return "4";
  if (f.includes("guests")) return "4";
  if (f.includes("travel type")) return "family";
  if (f.includes("bedroom")) return "3";
  if (f.includes("bathroom") && f.includes("residential buy")) return "2";
  if (f.includes("toilet") && f.includes("residential buy")) return "2";
  if (f.includes("car park") && f.includes("residential buy")) return "1";
  if (f.includes("bathroom")) return "2";
  if (f.includes("property subtype")) return "residential";
  if (f.includes("property type") && f.includes("shortlet")) return "Studio";
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
  if (f.includes("minimum land size") && f.includes("sqm")) return "450";
  if (f.includes("maximum land size") && f.includes("sqm")) return "900";
  if (f.includes("minimum land size")) return "500";
  if (f.includes("maximum land size")) return "800";
  if (f.includes("land size") && f.includes("single")) return "500";
  if (f.includes("land measurement unit")) return "plot";
  if (f.includes("measurement unit for land")) return "plot";
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
  const f = focus.toLowerCase().replace(/\u2013|\u2014/g, "-");
  const sample = preferenceSample(focus);
  const lab = fieldPromptLabel(focus);

  if (f.includes("preference type")) {
    const speak = pickVariant(
      [
        "Start by saying whether this is Buy, Rent, Shortlet, Off-Plan, or joint venture.",
        "Say Buy, Rent, Shortlet, Off-Plan, or joint venture first.",
        "Which listing type is this: Buy, Rent, Shortlet, Off-Plan, or joint venture? Say it at the beginning.",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("expected completion date")) {
    const speak = pickVariant(
      [
        "When do you expect the off-plan property to be completed? Use a date like year-month-day, for example 2027-06-30.",
        "What is your expected completion date for this off-plan project?",
        "By when should the property be ready? Enter a date, for example 2027-12-01.",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("development stage") && f.includes("off-plan")) {
    const speak = pickVariant(
      [
        "What development stage is the project at now? For example planning, foundation, structural, finishing, or near completion.",
        "Which stage best describes the build: planning, foundation, structural, finishing, or near completion?",
        "Current development stage for this off-plan property?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("payment plan") && f.includes("off-plan")) {
    const speak = pickVariant(
      [
        "Which payment plan do you prefer? Outright payment, or an installment plan such as 6, 12, 18, 24, or 36 months.",
        "How would you like to pay: outright or installments over several months?",
        "Preferred off-plan payment plan?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("preference location - state")) {
    const speak = "Which Nigerian state?";
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("preference location - lga")) {
    const speak = "Which local government area?";
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("preference location - area")) {
    const speak = "Which area or neighbourhood within that local government area?";
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("location state") || (f.includes("state") && f.includes("required") && f.includes("location"))) {
    const speak = pickVariant(
      ["Which state?", "What state?", "Which Nigerian state should it be in?"],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (
    f.includes("at least one lga") ||
    f.includes("lga or area name") ||
    (f.includes("lga") &&
      f.includes("area") &&
      !f.includes("preference location") &&
      !f.includes("property location"))
  ) {
    const speak = pickVariant(
      [
        "Which local government area or area name?",
        "What local government area or area?",
        "Name a local government area or area.",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("area name") || f.includes("custom location")) {
    const speak = pickVariant(["Which area or custom location?", "What area are you targeting?", "Name the area."], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("min price")) {
    const speak = pickVariant(
      [
        "What is your minimum budget in Naira? Use comma-separated digits, for example 20,000,000.",
        "Minimum price in Naira, comma-separated thousands.",
        "What is your budget floor in Naira?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("max price must")) {
    const speak = pickVariant(
      [
        "Maximum must be higher than minimum. Enter maximum price in Naira with commas.",
        "Enter a maximum above your minimum, comma-separated.",
        "What upper budget in Naira, comma-separated?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("max price")) {
    const speak = pickVariant(
      [
        "What is your maximum budget in Naira? Use commas, for example 50,000,000.",
        "Top of your budget in Naira, comma-separated.",
        "What is your maximum price in Naira with comma thousands separators?",
      ],
      variant,
    );
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

  if (f.includes("maximum guests")) {
    const speak = pickVariant(
      ["Maximum guests the unit should allow?", "How many guests maximum?", "Max guest capacity?"],
      variant,
    );
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

  if (f.includes("bathroom") && f.includes("shortlet")) {
    const speak = pickVariant(["How many bathrooms?", "Bathroom count?", "Bathrooms needed?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bathroom") && f.includes("residential buy")) {
    const speak = pickVariant(
      [
        "How many bathrooms? Say 1 to 10, or more for more than ten.",
        "Bathroom count for your buy preference: 1 through 10, or more.",
        "Minimum bathrooms: a number from 1 to 10, or say more.",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("toilet") && f.includes("residential buy")) {
    const speak = pickVariant(
      ["How many toilets?", "Number of toilets?", "Toilet count?"],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("car park") && f.includes("residential buy")) {
    const speak = pickVariant(
      ["How many car parking spaces?", "Number of car parks?", "Parking spaces needed?"],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bathroom")) {
    const speak = pickVariant(["How many bathrooms?", "Bathroom count?", "Bathrooms needed?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("property subtype")) {
    const speak = f.includes("off-plan")
      ? "Property subtype for off-plan: land, residential, or commercial."
      : "Property subtype: land, residential, or commercial for a buy preference, or your rent subtype such as flat or bungalow.";
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("property type") && f.includes("shortlet")) {
    const speak = pickVariant(
      ["Which shortlet property type?", "Studio, one-bed, or two-bed?", "Which unit type?"],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("property type")) {
    const speak = pickVariant(["Which property type?", "What type of property?", "Land, residential, or commercial?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("land measurement unit")) {
    const speak =
      "Measurement unit for land size: plot, square metres, hectares, or acres?";
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("minimum land size") && f.includes("sqm")) {
    const speak = pickVariant(
      [
        "Minimum land size in square metres?",
        "Smallest square metres you want?",
        "Minimum land size number?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("minimum land size") && f.includes("land requirements")) {
    const speak = pickVariant(
      [
        "Minimum land size for this joint venture requirement?",
        "How much land at minimum?",
        "Minimum land size number?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("maximum land size") && f.includes("buy")) {
    const speak = pickVariant(
      [
        "Maximum land size for buy?",
        "Largest land size in that unit?",
        "Maximum land size number?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("land size") && f.includes("single")) {
    const speak = pickVariant(["Total land size in that unit?", "Single land size amount?", "Land size number?"], variant);
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

  if (f.includes("measurement unit for land")) {
    const speak = "Which unit for land size: plot, square metres, hectares, or acres?";
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("measurement unit")) {
    const speak = "Which measurement unit: plot, square metres, hectares, or acres?";
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("jv type")) {
    const speak = pickVariant(
      [
        "Which joint venture type?",
        "Equity split, lease-to-build, or development partner?",
        "Joint venture structure?",
      ],
      variant,
    );
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
  if (f.includes("property type") && (f.includes("sale") || f.includes("listing") || f.includes("start"))) return "Sale";
  if (f.includes("category")) return "Residential";
  if (f.includes("location") && f.includes("state")) return "Lagos, Lekki, Ikeja";
  if (f.includes("lga") || f.includes("local government")) return "Ikeja";
  if (f.includes("price")) return "85,000,000";
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

  if (f.includes("property type") && (f.includes("sale") || f.includes("listing") || f.includes("start"))) {
    const speak = pickVariant(
      [
        "Start with listing type: Sale, Rent, Shortlet, or joint venture.",
        "Say whether you are listing for Sale, Rent, Shortlet, or joint venture first.",
        "Which listing type is this: Sale, Rent, Shortlet, or joint venture?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("category")) {
    const speak = pickVariant(["Residential, commercial, or land?", "Property category?", "Which category?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("location") && f.includes("state")) {
    const speak = pickVariant(
      ["State, area, and local government area?", "Full location?", "Where is it located?"],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("lga") || f.includes("local government")) {
    const speak = pickVariant(
      ["Which local government area?", "Local government area name?", "Name the local government area."],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("price")) {
    const speak = pickVariant(
      [
        "Price in Naira with commas, for example 85,000,000?",
        "Asking price in Naira, comma-separated digits?",
        "How much in Naira? Use comma thousands separators.",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("description")) {
    const speak = pickVariant(["Short description?", "Describe the property.", "One-line summary?"], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("bedroom") && f.includes("bathroom") && f.includes("toilet")) {
    const speak = pickVariant(
      [
        "How many bedrooms, bathrooms, and toilets?",
        "Bedrooms, bathrooms, and toilet counts?",
        "Room counts: bedrooms, bathrooms, and toilets?",
      ],
      variant,
    );
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
    const speak = pickVariant(
      [
        "How many parking spaces? Say a number, or 0 for none.",
        "Number of car parks? Use 0 if there is no parking.",
        "Parking spaces count?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("document") || f.includes("title")) {
    const speak = pickVariant(["Which title documents?", "Documents on the property?", "List documents."], variant);
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("land size")) {
    const speak = pickVariant(
      [
        "Land size: give the measurement unit and numeric size, e.g. 500 Square Meter or 2 Acres.",
        "What is the land size and unit (Plot, Acres, Square Meter)?",
        "Land size with unit?",
      ],
      variant,
    );
    return { displayLine: `${speak} (format: ${sample})`, speakLine: speak };
  }

  if (f.includes("measurement type")) {
    const speak = pickVariant(["Land measured in what unit?", "Measurement type?", "Plot or square metres?"], variant);
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
