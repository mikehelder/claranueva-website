const samples = [
    `**TITLE:** Asafetida Powder

**INGREDIENTS:**

* Asafetida - 100 gm
* Dry Ginger - 2 gm
* Pepper - 100 gm
* Cummin Seed - 100 gm
* Long Pepper - 100 gm
* Ajwain - 100 gm
* Dry Curry Leaf - 25 gm

**PREPARATION:**

1. Fry asafetida with little ghee, and powder it.
2. Remain all powder together mix with asafetida powder.
3. One teaspoon powder + Little Salt, mix with ghee - mix this with the rice you eat, will make good digestion, gas trouble.

**PRIMARY_DOSHA:** Pitta

**TASTES:** Pungent, Salty

**POTENCY:** Hot

**SEASONS:** Summer, Monsoon

**DOSHA_EXPLANATION:** This recipe benefits Pitta dosha due to the presence of asafetida, which is known to balance Pitta. The combination of asafetida, ginger, and pepper further supports this, as they are all known to have a cooling effect on the body. Additionally, the use of little ghee and salt adds a salty taste`,

    `**TITLE:** Vathamaryana Lag Soup

**INGREDIENTS:**

* Vathamaryana leaf (150 g)
* Mint water
* Dal (50 g)
* Pepper
* Smallonion sliced
* Garlic sliced
* Lemon juice
* Salt
* Asafetida
* Coconut oil
* Red chillie
* Curry leaf
* Mustard seed
* Salt

**PREPARATION:**

1. Cook with 2 cup water - then strain (cook with 2 cup water - then strain)
2. Cook dal with 1 cup water, then grind in mixture, filter and get the water only
3. Fry red chillie in heated coconut oil and take it out
4. Fry onan, for 4 minute, then add curry leaf and mustard seed, then add leaf cooked water, dalwater, garlic, salt, asafetida and boil well

**PRIMARY_DOSHA:** Vata

**TASTES:** Pungent, Bitter

**POTENCY:** Hot

**SEASONS:** Winter

**DOSHA_EXPLANATION:** This is an ideal soup for Vata dosha as it is hot and pungent, which helps to balance the cold`,

    `**TITLE:** Boalen Rice

**INGREDIENTS:**
- Ria Blake - 250gm
- C Soak in water by 2 0g minute(70)
- 4hoer Soaked greenpeace - 1/2 Cup
- grated carrot - 1/2 Cup
- grated cucumber - 1/2 Cup
- grated Beetroot - 1/2 Cup
- Turmeric powder - little pinch
- Mint - little
- Tomato - 1
- pepper powder - 1/2 spoon
- Cummins powder - 1/2 spoon
- Salt - little

**PREPARATION:**
1. Cook all vegetables with turmeric powder, salt.
2. When it is cooked well, add grated coconut, rice flakes, pepper powder, cummins seeds.

**PRIMARY_DOSHA:** Pitta

**TASTES:** Pungent, Bitter

**POTENCY:** Hot

**SEASONS:** Summer, Monsoon

**DOSHA_EXPLANATION:** This recipe is beneficial for Pitta because of the presence of cooling ingredients like cucumber, beetroot, and coconut, which help balance the heat of the turmeric and pepper. The pungent taste`
];

function parseField(text, fieldName) {
    const headerRegex = new RegExp(`(?:\\*{1,2}\\s*)?${fieldName}\\s*:\\s*`, 'i');
    const headerMatch = headerRegex.exec(text);
    if (!headerMatch) return '';
    const startIndex = headerMatch.index + headerMatch[0].length;

    const nextHeaderRegex = /\n\s*(?:\*{1,2}\s*)?(TITLE|INGREDIENTS|PREPARATION|PRIMARY_DOSHA|TASTES|POTENCY|SEASONS|DOSHA_EXPLANATION|DOSHA EXPLANATION|DOSHAEXPLANATION)\s*:/ig;
    nextHeaderRegex.lastIndex = startIndex;
    const nextMatch = nextHeaderRegex.exec(text);
    const endIndex = nextMatch ? nextMatch.index : text.length;
    return text.slice(startIndex, endIndex).trim();
}

function cleanField(s) {
    return String(s || '').replace(/^[\*\s]+/, '').trim();
}

function parseIngredients(ingredientsText) {
    const ingredientLines = String(ingredientsText || '')
        .split(/\r?\n+/)
        .map(line => line.trim())
        .map(line => line.replace(/^[\u2022\*\-\s]+/, ''))
        .filter(Boolean);

    return ingredientLines.map((line) => {
        let m = line.match(/^(.*?)\s*[-–—]\s*(.+)$/);
        if (m) return { name: m[1].trim(), quantity: m[2].trim() };

        m = line.match(/^(.*?)\s*\(([^)]+)\)$/);
        if (m) return { name: m[1].trim(), quantity: m[2].trim() };

        m = line.match(/^([\d\/\.\s]*?(?:g|kg|ml|l|cup|cups|tsp|tbsp|tablespoon|tablespoons|teaspoon|teaspoons|pinch|clove|cloves|slice|slices)\b)\s+(.+)$/i);
        if (m) return { name: m[2].trim(), quantity: m[1].trim() };

        return { name: line, quantity: '' };
    });
}

function parsePreparation(preparationText) {
    const prepLines = String(preparationText || '')
        .split(/\r?\n+/)
        .map(line => line.trim())
        .map(line => line.replace(/^[\u2022\*\-\s]+/, ''))
        .map(line => line.replace(/^\d+\.\s*/, ''))
        .filter(Boolean);

    return prepLines.map(line => line.replace(/\s{2,}/g, ' '));
}

samples.forEach((text, idx) => {
    console.log('\n==================== SAMPLE ' + (idx + 1) + ' ====================');
    console.log('\n--- RAW RESULT START ---');
    console.log(text);
    console.log('\n--- RAW RESULT END ---\n');

    const fields = ['TITLE', 'INGREDIENTS', 'PREPARATION', 'PRIMARY_DOSHA', 'TASTES', 'POTENCY', 'SEASONS', 'DOSHA_EXPLANATION'];
    const parsed = {};
    fields.forEach(f => {
        parsed[f] = cleanField(parseField(text, f) || '');
    });

    console.log('--- Parsed fields summary ---');
    fields.forEach(f => {
        const val = parsed[f];
        if (!val) {
            console.log(`${f}: (missing)`);
        } else {
            const oneLine = val.split(/\r?\n/).slice(0, 3).join(' | ');
            console.log(`${f}: ${oneLine}${val.split(/\r?\n/).length > 3 ? ' ...' : ''}`);
        }
    });

    const ingredients = parseIngredients(parsed['INGREDIENTS']);
    const preparation = parsePreparation(parsed['PREPARATION']);

    console.log('\n--- Parsed ingredients (' + ingredients.length + ') ---');
    console.log(ingredients);

    console.log('\n--- Parsed preparation (' + preparation.length + ') ---');
    console.log(preparation);

    console.log('\n--- DOSHA_EXPLANATION ---');
    console.log(parsed['DOSHA_EXPLANATION'] || '(missing)');

});

