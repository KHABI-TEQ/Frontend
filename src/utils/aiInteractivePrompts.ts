/** @format */

/** Strip trailing "(required: …)" etc. for shorter labels. */
export function fieldPromptLabel(field: string): string {
  return field.replace(/\s*\([^)]*\)\s*$/g, "").trim() || field;
}

function pickVariant<T>(choices: T[], variant: number): T {
  return choices[Math.abs(variant) % choices.length] ?? choices[0];
}

/**
 * One display line (the question only) and a separate speak line.
 */
export function getPreferenceFieldPrompt(
  focus: string,
  variant: number,
  preferenceType?: string,
): { displayLine: string; speakLine: string } {
  const f = focus.toLowerCase().replace(/\u2013|\u2014/g, "-");
  const pt = String(preferenceType || "").toLowerCase().replace(/\s+/g, "-");
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("expected completion date")) {
    const speak = "What is your expected completion date?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("development stage") && f.includes("off-plan")) {
    const speak = "What is the current development stage?";
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("preference location - state")) {
    const speak = "Khabiteq is piloting in Lagos. Which Lagos local government area?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("preference location - lga")) {
    const speak = "Which Lagos local government area?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("preference location - area")) {
    const speak = "Which area or neighbourhood within that local government area?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("location state") || (f.includes("state") && f.includes("required") && f.includes("location"))) {
    const speak = "Khabiteq is piloting in Lagos. Which Lagos local government area?";
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("area name") || f.includes("custom location")) {
    const speak = pickVariant(["Which area or custom location?", "What area are you targeting?", "Name the area."], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("min price")) {
    const speak = "What is your minimum budget in Naira?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("max price must")) {
    const speak = "What is your maximum budget in Naira?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("max price")) {
    const speak = "What is your maximum budget in Naira?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("company name")) {
    const speak = pickVariant(["What's the company name?", "Company legal name?", "Which company is this for?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("contact person")) {
    const speak = pickVariant(["Who is the contact person?", "Contact person's full name?", "Name of your representative?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("full name") && !f.includes("contact person")) {
    const speak = pickVariant(["What's your full name?", "Your name?", "How should we address you?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("email")) {
    const speak = pickVariant(["What's your email?", "Your email address?", "Best email to reach you?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("phone")) {
    const speak = pickVariant(["What's your phone number?", "A phone we can call?", "Your mobile number?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("contact email or phone")) {
    const speak = pickVariant(["Share an email or phone number.", "What's your email or phone?", "How can we contact you?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("check-in")) {
    const speak = pickVariant(["Check-in date?", "When do you want to check in?", "Arrival date?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("check-out")) {
    const speak = pickVariant(["Check-out date?", "Departure date?", "When are you leaving?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("maximum guests")) {
    const speak = pickVariant(
      ["Maximum guests the unit should allow?", "How many guests maximum?", "Max guest capacity?"],
      variant,
    );
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("guests")) {
    const speak = pickVariant(["How many guests?", "Number of guests?", "Headcount?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("travel type")) {
    const speak = "What travel type?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("bathroom")) {
    const speak = "How many bathrooms?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("toilet")) {
    const speak = "How many toilets?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("car park") || f.includes("parking")) {
    const speak = "How many car parks?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("bedroom") && !f.includes("bathroom")) {
    const speak = "How many bedrooms?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("property subtype")) {
    if (pt === "rent" || f.includes("self-con") || f.includes("flat")) {
      const speak = "Residential or commercial?";
      return { displayLine: speak, speakLine: speak };
    }
    const speak = "Land, residential, or commercial?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("property type") && f.includes("shortlet")) {
    const speak = "Which shortlet property type?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("property type")) {
    const speak = pickVariant(["Which property type?", "What type of property?", "Land, residential, or commercial?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("land measurement unit")) {
    const speak =
      "Measurement unit for land size: plot, square metres, hectares, or acres?";
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("land size") && f.includes("single")) {
    const speak = pickVariant(["Total land size in that unit?", "Single land size amount?", "Land size number?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("building type")) {
    const speak = "What type of building?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("property condition")) {
    const speak = "What condition?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("document type") || (f.includes("document") && (f.includes("least") || f.includes("need")))) {
    const speak = "Which documents do you need?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("lease term")) {
    const speak = pickVariant(["Preferred lease term?", "Six months or one year?", "Lease length?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("landmark")) {
    const speak = pickVariant(["Any nearby landmark?", "Landmark nearby?", "What's nearby?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("features") || f.includes("amenities")) {
    const speak = "Which features do you want?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("additional notes") || f.includes("special requirements")) {
    const speak = pickVariant(["Any extra notes?", "Special requirements?", "Anything else to add?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("land size") && f.includes("jv")) {
    const speak = pickVariant(["Land size amount?", "How large is the plot?", "Land size number?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("measurement unit for land")) {
    const speak = "Which unit for land size: plot, square metres, hectares, or acres?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("measurement unit")) {
    const speak = "Which measurement unit: plot, square metres, hectares, or acres?";
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("development type")) {
    const speak = "What are you developing?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("preferred sharing") || f.includes("sharing ratio")) {
    const speak = "What sharing ratio do you prefer?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("minimum title") || f.includes("title requirement") || f.includes("title document")) {
    const speak = "Which title documents do you need?";
    return { displayLine: speak, speakLine: speak };
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
  return { displayLine: speak, speakLine: speak };
}

export function getPropertyFieldPrompt(
  focus: string,
  variant: number,
): { displayLine: string; speakLine: string } {
  const f = focus.toLowerCase();
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("category")) {
    const speak = pickVariant(["Residential, commercial, or land?", "Property category?", "Which category?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("location") && f.includes("state")) {
    const speak = pickVariant(
      ["Which Lagos local government area and neighbourhood?", "Where in Lagos is it?", "Name the Lagos LGA and area."],
      variant,
    );
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("lga") || f.includes("local government")) {
    const speak = pickVariant(
      ["Which local government area?", "Local government area name?", "Name the local government area."],
      variant,
    );
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("price")) {
    const speak = "What is the price in Naira?";
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("description")) {
    const speak = pickVariant(["Short description?", "Describe the property.", "One-line summary?"], variant);
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("bathroom") && f.includes("toilet")) {
    const speak = pickVariant(["How many bathrooms and toilets?", "Bath and toilet counts?", "Bathrooms and toilets?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("bathroom")) {
    const speak = pickVariant(["How many bathrooms?", "Bathroom count?", "Bathrooms?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("toilet")) {
    const speak = pickVariant(["How many toilets?", "Toilet count?", "Toilets?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("bedroom")) {
    const speak = pickVariant(["How many bedrooms?", "Bedroom count?", "Bedrooms?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("condition")) {
    const speak = pickVariant(["Property condition?", "New or used?", "Condition?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("building")) {
    const speak = pickVariant(["Type of building?", "Flat or duplex?", "Building type?"], variant);
    return { displayLine: speak, speakLine: speak };
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
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("document") || f.includes("title")) {
    const speak = pickVariant(["Which title documents?", "Documents on the property?", "List documents."], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("land size")) {
    const speak = pickVariant(
      [
        "What is the land size?",
        "What is the land size and unit?",
        "Land size with unit?",
      ],
      variant,
    );
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("measurement type")) {
    const speak = pickVariant(["Land measured in what unit?", "Measurement type?", "Plot or square metres?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  if (f.includes("features")) {
    const speak = pickVariant(["Key features?", "List main features.", "What features?"], variant);
    return { displayLine: speak, speakLine: speak };
  }

  const speak = pickVariant([`What ${lab}?`, `Which ${lab}?`, `Tell me the ${lab}.`, `Could you share ${lab}?`], variant);
  return { displayLine: speak, speakLine: speak };
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
