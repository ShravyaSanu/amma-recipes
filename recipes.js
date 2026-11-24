/*
  Recipes compiled from the WhatsApp group "Amma & Muddu's Recipes" (Jan 2022 – Nov 2026).
  Facebook and Instagram links are left out on purpose.

  Format of each recipe:
    id     unique short name (letters, numbers, dashes)
    title  dish name
    cat    category id  (see CATEGORIES)
    sub    sub-section name (only for categories that have sub-sections)
    by     "Amma" or "Me"
    date   date it was shared (YYYY-MM-DD)
    parts  one or more versions; each has a heading (h), ingredients (ing) and steps,
           written one per line
    tips   extra tips, one per line
*/

const CATEGORIES = [
  { id: "breakfast", name: "Breakfast", icon: "🥞", desc: "Dosa, phad, paratha, uppittu" },
  { id: "rice", name: "Rice & Pulao", icon: "🍚", desc: "Pulao, bhath, khichdi" },
  { id: "curry", name: "Curry", icon: "🍲", desc: "Ambat, sambar, saaru, kadhi, tambli, dal",
    subs: ["Ambat", "Sambar", "Saaru", "Kadhi", "Tambli", "Dal"] },
  { id: "sides", name: "Side Dishes", icon: "🥗", desc: "Sasam, sabji, stir fry",
    subs: ["Sasam", "Sabji", "Stir Fry"] },
  { id: "chutney", name: "Chutneys & Pickles", icon: "🫙", desc: "Chutney, thecha, pickle" },
  { id: "sweets", name: "Sweets", icon: "🍮", desc: "Kheer and desserts" },
];

const RECIPES = [
  /* ───────────── BREAKFAST ───────────── */
  {
    id: "urad-rice-dose", title: "Urad Dal & Rice Dose (and Uttappa)", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `1 cup dosa rice
Urad dal – 60% of the same cup
1/2 tsp sugar
A little cooked rice
Salt`,
      steps: `Soak the dosa rice and urad dal separately for 6–7 hours (in winter soaking takes more time).
Grind the urad dal first, then the dosa rice with the sugar and cooked rice.
Add salt and leave it to ferment overnight.
Next morning prepare dosas.`,
    }],
    tips: `The same batter is used for making Uttappa.`,
  },
  {
    id: "mushti-dosa", title: "Mushti Dosa", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `1 cup dosa rice
1/2 cup urad dal
1/2 spoon methi seeds
1/2 cup grated coconut
A little sugar
Soaked fova (poha)
Salt`,
      steps: `Soak the dosa rice, urad dal and methi seeds in warm water for 6–7 hours.
While grinding, add the grated coconut, a little sugar and the soaked fova.
Add salt to taste and leave overnight.
Next morning prepare dosas, sprinkling chutney powder on them.`,
    }],
  },
  {
    id: "masala-dosa", title: "Masala Dosa", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `1 cup dosa rice
Urad dal – 40% of the cup
1 tbsp chana dal
1/4 tsp methi seeds
1/2 cup soaked paper fova (poha)
A fistful of cooked rice
1/2 tsp sugar
Salt`,
      steps: `Soak the dosa rice, urad dal, chana dal and methi seeds for 7–8 hours.
While grinding, add the soaked paper fova, cooked rice and sugar with the soaked ingredients.
Add salt and leave it to ferment.
Next day make dosas and serve with chutney powder, potato sabji and coconut chutney.`,
    }],
  },
  {
    id: "phad", title: "Phad", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `1 cup rice
1/2 cup urad dal
1 tbsp chana dal
1/2 tsp methi seeds
A fistful of cooked rice
1/4 tsp sugar
Salt
Grated carrot, chopped onion, curry leaves, capsicum, coriander leaves`,
      steps: `Soak the rice, urad dal, chana dal and methi seeds for 7–8 hours.
While grinding, add the cooked rice and sugar.
Add salt to taste and leave it to ferment.
Next day add grated carrot, chopped onion, curry leaves, capsicum and coriander leaves and prepare Phad.
Serve hot with tomato chutney.`,
    }],
  },
  {
    id: "instant-phad", title: "Instant Phad", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [
      {
        h: "Version 1 – with urad dal",
        ing: `1/2 cup urad dal
1 cup Bombay rava
Salt
Chopped onion, carrot, capsicum, coriander leaves
Paste of 2 green chillies (optional)`,
        steps: `Soak the urad dal for about 7–8 hours and grind.
Add salt and leave it overnight to ferment.
Next morning add the Bombay rava, chopped onion, carrot, capsicum and coriander leaves. Add the green chilli paste if you want.
Prepare Phad after half an hour.`,
      },
      {
        h: "Version 2 – rava and curd",
        ing: `1 cup Bombay rava
A little sour curd
2 green chillies
Chopped onion, carrot, capsicum, coriander leaves`,
        steps: `Soak the Bombay rava in a little sour curd for 15–20 minutes.
Grind it with the green chillies.
Add chopped onion, carrot, capsicum and coriander leaves and prepare Phad.`,
      },
    ],
    tips: `Some people add soda for crispness.`,
  },
  {
    id: "neer-dosa", title: "Neer Dosa (all versions)", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [
      {
        h: "Plain Neer Dosa",
        ing: `Rice
Grated coconut
Salt`,
        steps: `Soak the rice overnight.
Strain the water and grind in the mixer. When 3/4 done, add the grated coconut and grind again to a smooth batter.
Add salt and prepare thin dosas.`,
      },
      {
        h: "1st Version",
        ing: `1/2 cup dosa rice
1 tbsp grated coconut
Salt`,
        steps: `Soak the dosa rice overnight.
Next morning add the grated coconut and grind to a fine paste.
Add salt and prepare dosas.`,
        note: `Remember: try to grind the rice without water. If that is not possible, add only a teaspoon or tablespoon of water, otherwise you will not get a fine paste.`,
      },
      {
        h: "2nd Version – with jeera and onion",
        ing: `Soaked rice
Grated coconut
Green chillies
1/2 tsp jeera
Chopped onion and coriander leaves`,
        steps: `Soak the rice as usual. While grinding, add the grated coconut, green chillies and jeera.
Add chopped onion and coriander leaves to the ground paste and prepare dosas.`,
      },
      {
        h: "3rd Version – Tomato Dosa / Masala Neer Dose",
        ing: `Soaked rice
Grated coconut
1/4 tsp jeera
Hing
1/4 tsp red chilli powder
1/4 of a big tomato, chopped
Salt`,
        steps: `Strain the soaked rice and grind with the red chilli powder, jeera, hing, chopped tomato and finally the grated coconut.
Add salt and prepare thin dosas like Neer dosa.`,
      },
      {
        h: "4th Version – with greens",
        ing: `Soaked rice
Grated coconut
1 green chilli
Finely chopped onion
Basale (vali) or methi leaves`,
        steps: `Grind the soaked rice, grated coconut and the green chilli.
Add finely chopped onion and basale or methi leaves and prepare dosas.`,
      },
    ],
    tips: `Except for the 1st version, all the varieties taste good with coconut chutney.
Plain Neer dosa goes well with Red (Ginger) Chutney.`,
  },
  {
    id: "rave-doddak", title: "Cucumber Rave Doddak", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [
      {
        h: "Amma's recipe",
        ing: `Cucumber or Mangalore cucumber, grated
2 green chillies and ginger (paste)
Onion, chopped
Grated coconut
Coriander leaves
Jeera, sugar, salt
A fistful of wheat flour
Bombay rava`,
        steps: `Grate the cucumber. Make a paste of the green chillies and ginger. Chop the onion and coriander leaves.
Add the grated cucumber, coconut, ground paste, onion, coriander leaves, jeera, sugar, salt and wheat flour to the Bombay rava.
Mix thoroughly and leave for 15–30 minutes.
Prepare dosas and serve hot with ghee and groundnut chutney powder.`,
      },
      {
        h: "My notes",
        steps: `Grind chilli and ginger.
Grate cucumber, add onion, coriander, jeera, salt and a little sugar.
Add the ground chilli-ginger paste.
Add rava and wheat flour.`,
      },
    ],
    tips: `Add a tsp or two of rice flour to the batter – the dosas will be crispy.`,
  },
  {
    id: "tappale-dose", title: "Tappale Dose (Karnataka Appam)", cat: "breakfast", by: "Amma", date: "2025-09-16",
    parts: [{
      ing: `3 cups rice
1 cup tuar dal
Salt
Grated coconut
Jeera
Curry leaves, coriander leaves
Paste of green chillies and ginger
Mustard seeds (for seasoning)`,
      steps: `Soak the rice and tuar dal for 4 hours and grind coarsely.
Add salt, grated coconut, jeera, curry leaves, coriander leaves and the green chilli–ginger paste.
Finally add a seasoning of mustard seeds and prepare dosas.`,
    }],
  },
  {
    id: "pesarattu", title: "Pesarattu Dosa", cat: "breakfast", by: "Amma", date: "2025-09-30",
    parts: [{
      ing: `About 3/4 cup moong
1/4 cup rice
Green chilli
1/2 onion, chopped
Curry leaves, ginger, coriander leaves
Salt`,
      steps: `Soak the moong and rice overnight.
Next day grind with the green chilli, onion, curry leaves, ginger and coriander leaves.
Add salt and prepare dosas immediately – this dosa doesn't need fermentation.
Spread the batter on the tawa like masala dosa and sprinkle chutney powder before taking it off the tawa.
Serve hot with tomato chutney.`,
    }],
  },
  {
    id: "masala-paratha", title: "Masala Paratha", cat: "breakfast", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `1 cup wheat flour
Salt, turmeric powder
1/4 tsp red chilli powder
2 tsp besan
Garam masala powder
1/4 tsp each of dhaniya, jeera and amchur powder
Kasoori methi
Oil`,
      steps: `Add all the ingredients to the wheat flour and prepare a dough.
Leave it for half an hour.
Prepare parathas and serve.`,
    }],
  },
  {
    id: "mooli-parota", title: "Mooli Parota", cat: "breakfast", by: "Amma", date: "2025-07-01",
    parts: [{
      ing: `Radish, grated
Salt, a pinch of turmeric
1/4 tsp red chilli powder
1/4 tsp garam masala powder
2 tbsp besan
1/4 tsp dhaniya powder
1/4 tsp jeera powder
1/4 tsp amchur powder
2 tbsp oil
Crushed badesop (saunf)
Wheat flour`,
      steps: `Mix the grated radish with all the spices, besan, oil and crushed badesop.
Keep aside till the radish leaves its juice.
Add wheat flour and make a dough. Only add extra water if necessary.
Make parotas and serve hot.`,
    }],
  },
  {
    id: "mudde-uppittu", title: "Mudde Uppittu", cat: "breakfast", by: "Amma", date: "2026-07-03",
    parts: [{
      ing: `2 big onions, chopped
Ginger, 2 small green chillies, curry leaves (paste)
Tomato, chopped (optional)
1/2 cup Bombay rava
1 glass water
Salt, 1/2 tsp sugar, ghee
2 tbsp milk (optional)
Grated coconut
Coriander leaves`,
      steps: `Make a paste of ginger, green chillies and curry leaves. Chop the onions (and tomato, if using).
Fry the Bombay rava and keep aside.
Heat oil, add the chopped onions and the ground paste and fry. Add the tomato.
Add a glass of water and bring to a boil. Add salt, sugar and ghee to the boiling water.
Add the milk (optional), then the fried rava, stirring constantly so that no lumps form.
Add the grated coconut and cover with the lid for a while, till the rava cooks.
Garnish with chopped coriander leaves and serve.`,
    }],
  },
  {
    id: "kalille-fovu", title: "Kalille Fovu (Fova)", cat: "breakfast", by: "Amma", date: "2025-07-07",
    parts: [{
      ing: `Grated coconut
Finely chopped onion, green chillies, coriander leaves, cucumber
A little turmeric powder, salt, sugar
Paper fova (poha)`,
      steps: `Add the onion, green chillies, coriander leaves and cucumber to the grated coconut.
Add turmeric powder, salt and sugar and mix thoroughly till it leaves water.
Finally add the paper fova and mix thoroughly again. Serve.`,
    }],
  },

  /* ───────────── RICE & PULAO ───────────── */
  {
    id: "brown-veg-pulao", title: "Brown Vegetable Pulao", cat: "rice", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `3/4 cup rice
1 pack soya chunks
1 small carrot, 6–7 beans, 1 potato
A fistful of frozen peas (or soaked overnight)
For the paste – 1 cardamom, 1/5 jayikayi or badi elaichi, 2 cloves, 2 maratha moggu, 3 kallu huvu, 1/4 tsp each badesop and gasagase (fried in ghee)
2 tbsp grated coconut
2–3 small green chillies
1/2 tsp ginger garlic paste
1 tej patta
Oil + ghee, lemon juice, salt`,
      steps: `Wash the rice and keep aside. Soak the soya chunks in boiling water with a little salt.
Chop the carrot, beans and potato.
Shallow fry the whole spices in ghee. Grind them with the grated coconut, green chillies and ginger garlic paste to a paste.
Heat oil + ghee, add the tej patta and chopped vegetables and fry.
Add the ground paste and rice and fry.
Add water – double the quantity of rice (1:2) – the soaked soya chunks, 3–4 drops of lemon juice and salt.
Mix thoroughly and close the cooker lid. Switch off after three whistles.`,
    }],
  },
  {
    id: "tomato-bhath", title: "Tomato Bhath", cat: "rice", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `1 cup rice
2 onions and 2 tomatoes, chopped
2–3 green chillies, slit
1 pack soya chunks
2 cloves and 4 white pepper (powdered)
1/2 tsp ginger garlic paste
Salt, a few drops of lemon juice
Coriander leaves`,
      steps: `Soak the soya chunks in boiling water with a little salt. Wash and drain the rice.
Powder the cloves and white pepper.
Heat oil, add the onions, tomatoes, green chillies and ginger garlic paste and fry.
Add the rice and fry.
Add water (double the rice), the powdered spices, salt, lemon juice and soaked soya chunks and close the lid.
Switch off after three whistles. Garnish with chopped coriander leaves before serving.`,
    }],
  },
  {
    id: "yellow-pulao", title: "Yellow Pulao", cat: "rice", by: "Amma", date: "2025-06-22",
    parts: [
      {
        h: "Amma's recipe",
        ing: `1 cup rice
1 potato, a fistful of green peas, 7–8 beans, 1 carrot – cut thinly
Sliced onions, slit green chillies
2 cloves, 1 badi elaichi, 2 small elaichi, small star anise, 1/2 inch cinnamon
Ginger garlic paste
1/4 tsp garam masala powder, turmeric powder
Salt, a few drops of lemon juice
Coriander leaves, ghee`,
        steps: `Wash the rice, drain and keep aside.
Heat oil, add all the whole garam masala, onion, green chillies and ginger garlic paste.
Add the chopped vegetables and fry. Add the washed rice and fry gently.
When the rice starts sticking to the bottom of the cooker, add two cups of water, garam masala powder, turmeric, salt and lemon juice.
Close the cooker lid and switch off after three whistles.
Add chopped coriander leaves and ghee before serving.`,
      },
      {
        h: "My notes",
        steps: `Add ghee and oil, roast the garam masala (1 flake star anise, 2 cardamom, 2 cloves, 1 badi elaichi, 1/2 inch dalchini, 1 bay leaf).
Add onion, green chillies and ginger garlic paste.
Add vegetables and a bit of sugar to preserve the colour.
Add haldi and garam masala powder.
Add rice and fry.
Add water, lemon juice, salt and close.
Garnish with roasted cashews and coriander.`,
      },
    ],
  },
  {
    id: "white-pulao", title: "White Pulao", cat: "rice", by: "Amma", date: "2026-03-03",
    parts: [{
      ing: `Rice
Carrot and beans, chopped; green peas
Onions, sliced; 3–4 green chillies
Paneer cubes, boiled
3–4 cloves, small piece cinnamon, 1 tej patta, 1 badi elaichi, 2 green cardamom, 1 star anise
1 spoon ginger garlic paste
3–4 spoons coconut milk
Ghee + oil, salt`,
      steps: `Chop the vegetables, slice the onions and boil the paneer cubes.
Heat ghee and oil, add the whole spices.
Add the onions and green chillies, then the ginger garlic paste, vegetables and green peas and fry.
Add the washed rice and fry a little more.
Add water (1 : 1½), the boiled paneer, salt and coconut milk and close the lid.
Switch off after three whistles.`,
    }],
    tips: `Don't add lemon juice. Use water 1 : 1½ and allow only three whistles.`,
  },
  {
    id: "red-chilli-pulao", title: "Pulao with Red Chilli Powder", cat: "rice", by: "Amma", date: "2026-03-04",
    parts: [{
      ing: `Rice
For the powder – 1 tsp coriander seeds, 1/2 tsp cumin seeds, 2 cardamoms, a piece of cinnamon
Onion and 1 tomato, chopped
Beans, carrot, potato, green peas
1 tsp ginger garlic paste
Red chilli powder, turmeric powder, salt
A few drops of lemon juice
Oil + ghee, jeera
Ghee-fried cashews (optional)`,
      steps: `Fry the coriander seeds, cumin, cardamoms and cinnamon and powder them.
Heat oil + ghee, add jeera, onion, tomato and ginger garlic paste.
Add the vegetables and green peas. Add the washed rice and fry again.
Add red chilli powder, turmeric, the prepared powder, salt and water. Add a few drops of lemon juice.
Close the lid and switch off after three whistles.
Add ghee-fried cashews if you want. Serve hot with raita.`,
    }],
    tips: `If the flavour of the prepared powder is too low, add half a spoon of garam masala powder.`,
  },
  {
    id: "red-pulao", title: "Red Colour Pulao", cat: "rice", by: "Amma", date: "2026-11-07",
    parts: [{
      ing: `Rice
1 tsp coriander seeds, 1/2 tsp jeera, 3 cloves, 1/2 inch cinnamon (fried in ghee)
1 tbsp grated coconut
Turmeric powder, red chilli powder
Oil and ghee (equal)
Onion, tej patta, green cardamom, star anise
Tomato and vegetables of your choice
Salt, lemon juice, coriander leaves`,
      steps: `Fry the coriander seeds, jeera, cloves and cinnamon in ghee.
Grind with the grated coconut, turmeric and red chilli powder to a nice paste.
Heat oil and ghee, add chopped onion, tej patta, green cardamom and star anise and fry.
Add chopped tomato and vegetables and fry. Add the washed rice and fry.
Add water (1:2), salt and a few drops of lemon juice and close the cooker lid.
Switch off after three whistles. Add chopped coriander leaves and serve hot.`,
    }],
  },
  {
    id: "daliya-khichdi", title: "Daliya Khichdi", cat: "rice", by: "Me", date: "2023-04-13",
    parts: [{
      ing: `60% cup daliya
50% cup moong dal
Tadka – garlic, dry red chilli, 2 bay leaves, 2 cardamom, 1.5 tsp jeera, hing`,
      steps: `Cook the daliya and moong dal together.
Make the tadka with garlic, dry red chilli, bay leaves, cardamom, jeera and hing and add.`,
    }],
    tips: `Put slightly less salt – it doesn't need as much as rice.`,
  },

  /* ───────────── CURRY › AMBAT ───────────── */
  {
    id: "dali-randayi-ambat", title: "Dali Randayi / Ambat", cat: "curry", sub: "Ambat", by: "Amma", date: "2025-06-20",
    parts: [
      {
        h: "Amma's recipe",
        ing: `Tuar dal
Vegetables to boil with the dal – navilkosu, radish, beans, cabbage, cluster beans (mitkisanga)
Vegetables to boil separately – brinjal, drumstick, ladies finger (and very tender beans)
Salt, 2 Vattambe sol, 1/4 tsp jaggery
For the masala – 4 tbsp grated coconut, turmeric, 1/2 tsp red chilli powder, 1/2 tsp coriander seeds, 4–5 methi seeds, 1/4 onion
1/4 onion, 1 green chilli, 1/2 tomato (chopped)
Coriander leaves`,
        steps: `Boil the vegetables (with the dal or separately, as above).
Mash the dal and add it to the boiled vegetables. Add salt, Vattambe sol and jaggery and boil.
Grind the coconut, turmeric, red chilli powder, coriander seeds and methi seeds. Just before removing, add 1/4 chopped onion and grind.
Add this paste to the boiling dal and vegetables.
Add the remaining 1/4 chopped onion, the green chilli and 1/2 tomato and boil again.
Add chopped coriander leaves and serve.`,
      },
      {
        h: "My notes",
        ing: `Masala – coriander 1 full tsp, rice 0.5 tsp, methi 0.3 tsp
Toor dal – about 2.5 tsp (soak with haldi, hot water and oil)`,
        steps: `Boil the veggies with salt and sol.
Then add onion, tomato, green chilli, dal and the masala.
Garnish with coriander.`,
      },
    ],
    tips: `For cabbage, ladies finger and cluster beans (mitkisanga) ambat, add a tadka of coconut oil and chopped onion.`,
  },
  {
    id: "vatane-ambat", title: "Vatane (Dry Peas) Ambat", cat: "curry", sub: "Ambat", by: "Me", date: "2026-03-24",
    parts: [{
      ing: `Dry peas (boiled), potato
Onion, coconut, a pinch of khus khus
5–6 garlic pods
Garam masala, turmeric, chilli powder
1/4 tsp roasted rice
Curry leaves, coconut oil
Salt, Vattambe sol
Tomatoes, coriander leaves`,
      steps: `Roast onion, coconut, a pinch of khus khus and the garlic pods.
Grind garam masala, turmeric, chilli powder, the roasted coconut mix and the roasted rice.
Fry onion and curry leaves, add coconut oil for taste.
Add the boiled dry peas, potato, chopped tomatoes, salt and Vattambe sol.
Once cooked, add the ground masala and bring to a boil.
Add chopped coriander leaves and serve.`,
    }],
    tips: `Amma: fry 5–6 garlic pods with the coconut, as both potato and green peas cause gas.
Amma: add chopped tomatoes and reduce the Vattambe sol.`,
  },
  {
    id: "moong-ambat", title: "Moong Ambat", cat: "curry", sub: "Ambat", by: "Me", date: "2026-07-14",
    parts: [{
      ing: `Moong
Combinations – keerlu (bamboo shoot), potato, chole, ambade, raw banana, maddi
Masala – 2 cloves, 1/4 inch dalchini, 1/4 tsp khus khus, 1/4 tsp saunf, red chilli powder, haldi, coconut, 1/4 tsp rice, 4–5 garlic cloves, 1/4 onion, 1–2 tsp boiled moong skin
Salt, sol, a couple of green chillies`,
      steps: `Cook the keerlu for 2 whistles.
Grind all the masala ingredients.
Boil the moong separately, add salt and sol.
Add the keerlu as well and a couple of green chillies. Boil for a few minutes till cooked.
Add the ground masala and water as needed.
Bring everything to a boil and serve.`,
    }],
    tips: `Amma: raw banana and maddi can also be added.`,
  },
  {
    id: "batate-sol", title: "Batate Sol (Potato)", cat: "curry", sub: "Ambat", by: "Amma", date: "2025-06-19",
    parts: [
      {
        h: "Amma's recipe",
        ing: `Potatoes, chopped
4 tbsp grated coconut
Turmeric, 1/2 tsp red chilli powder
1/2 tsp fried rice
4–5 Teppal
Salt, Vattambe sol`,
        steps: `Boil the chopped potatoes.
Grind the coconut, turmeric, red chilli powder and fried rice. Add the Teppal and run the mixer in pulse mode.
Add this paste to the boiled potatoes with salt and Vattambe sol and boil again. Ready to serve.`,
      },
      {
        h: "My notes",
        steps: `Grind coconut, garlic, turmeric, red chilli powder and roasted rice. Once smooth, add a few Teppal and grind for a second or two.
Boil the potatoes until cooked with salt and Vattambe sol.
Add the ground mixture and bring to a boil.`,
      },
    ],
  },
  {
    id: "chana-alasande-gasi", title: "Kabuli Chana / Red or White Alasande Gasi", cat: "curry", sub: "Ambat", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `A fistful of kabuli chana or red/white alasande, soaked overnight
Elephant foot yam (suvarnagadde), chopped (optional)
Grated half coconut
3–4 red chillies, shallow fried (depending on size)
Turmeric powder, 2–3 garlic pods
2 tsp fried rice
Vattambe sol, salt
Chopped tomatoes
Chopped onion and coconut oil (tadka)
Coriander leaves`,
      steps: `Boil the soaked chana or alasande (with the suvarnagadde if using – it tastes good).
Grind the coconut with the fried red chillies, turmeric and garlic. Finally add the fried rice and grind again.
Add Vattambe sol, salt and the ground paste and boil further.
Add chopped tomatoes and a tadka of chopped onion in coconut oil and boil.
Add chopped coriander leaves and serve.`,
    }],
  },
  {
    id: "moge-ambashe", title: "Moge Ambashe (Mangalore Cucumber)", cat: "curry", sub: "Ambat", by: "Amma", date: "2022-06-14",
    parts: [{
      ing: `Mangalore cucumber, chopped
Grated coconut, turmeric, red chilli powder, chopped onion
Teppal (taimphal)
Salt, Vattambe sol, jaggery`,
      steps: `Cook the chopped Mangalore cucumber pieces and keep aside.
Grind the coconut, turmeric, red chilli powder and chopped onion. Add the Teppal at the end of grinding.
Add this masala, salt, Vattambe sol and jaggery to the cucumber and boil.
When almost done, add chopped onion and boil a little more.`,
    }],
    tips: `For Pink Bhajji Ambashe, don't add Teppal – add garlic instead. Everything else is the same.`,
  },

  /* ───────────── CURRY › SAMBAR ───────────── */
  {
    id: "sprouted-moong-sambar", title: "Sprouted Moong Sambar (Neetakka's recipe)", cat: "curry", sub: "Sambar", by: "Amma", date: "2023-04-11",
    parts: [{
      ing: `Sprouted moong
For grinding – fried dhaniya, methi seeds, urad dal, chana dal, garlic, onion
Seasoning – coconut oil and chopped onion`,
      steps: `Fry the dhaniya, methi, urad dal, chana dal, garlic and onion and grind.
Cook the sprouted moong, add the ground masala and boil.
Season with coconut oil and chopped onion.`,
    }],
  },
  {
    id: "huli-ammas-powder", title: "Huli using Amma's Powder", cat: "curry", sub: "Sambar", by: "Me", date: "2026-01-13",
    parts: [{
      ing: `Dal – 2.5 to 3 tsp (for one person)
Dry coconut, Amma's huli powder, red chilli powder, haldi
Pre-cooked veggies
Salt, tamarind paste, jaggery powder`,
      steps: `Grind dry coconut, huli powder, red chilli powder and haldi with hot water.
Add the pre-cooked veggies, salt and tamarind paste and let it simmer.
Add the ground dal and the masala paste. Bring to a boil.`,
    }],
    tips: `Amma: please also add jaggery powder.`,
  },

  /* ───────────── CURRY › SAARU ───────────── */
  {
    id: "tili-saaru", title: "Tili Saaru", cat: "curry", sub: "Saaru", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `2 tomatoes, chopped
Oil and ghee
Mustard seeds, 5–6 methi seeds, curry leaves, hing
Turmeric, salt, jaggery
Chana-sized ball of tamarind paste
Rasam powder
Coriander leaves`,
      steps: `Chop the tomatoes. Make a paste of 1½ tomatoes and keep 1/2 chopped.
Heat oil and ghee, add mustard seeds, methi seeds, curry leaves and hing.
Add the chopped tomato and fry until mushy.
Add the tomato paste, turmeric, salt, jaggery, tamarind paste and rasam powder and boil.
Add chopped coriander leaves and serve.`,
    }],
  },
  {
    id: "black-chana-saaru", title: "Black Chana Saaru (Rasam)", cat: "curry", sub: "Saaru", by: "Amma", date: "2025-06-21",
    parts: [
      {
        h: "Version 1",
        ing: `1/2 fistful black chana, soaked overnight
1 tbsp grated coconut
2 fried green chillies
Small chana-sized ginger, 3–4 small garlic pods
A little coriander leaves
2 small cloves, 1/4 inch cinnamon
Salt, tamarind paste, jaggery`,
        steps: `Boil the soaked black chana and let it cool.
Grind it with the coconut, green chillies, ginger, garlic, coriander leaves, cloves and cinnamon.
Add salt, tamarind paste and jaggery to taste and boil.
Serve hot with chopped coriander leaves.`,
      },
      {
        h: "Version 2 (with tomato tadka)",
        ing: `2 tbsp black chana, soaked overnight
2 tbsp grated coconut
2 shallow-fried chillies, 2–3 garlic pods
1/4 inch ginger (peeled), 2 cloves, 1/4 inch cinnamon
Coriander leaves
Mustard seeds, curry leaves, chopped tomato
1 tsp jaggery, salt, tamarind paste`,
        steps: `Grind the coconut, chillies, garlic, ginger, cloves, cinnamon, coriander leaves and the soaked chana.
Heat oil, add mustard seeds, curry leaves and chopped tomato and fry.
Add the ground paste, jaggery, salt and tamarind paste and boil.
Add chopped coriander leaves and serve hot.`,
      },
    ],
  },
  {
    id: "appehuli", title: "Appehuli (Raw Mango)", cat: "curry", sub: "Saaru", by: "Amma", date: "2025-06-18",
    parts: [
      {
        h: "Version 1",
        ing: `Raw mango
Turmeric, chopped green chillies
Jaggery, salt
Coconut oil and garlic (tadka)`,
        steps: `Peel and chop the mango and make a puree (no need to boil it first).
Add turmeric and chopped green chillies. Add jaggery and salt to taste.
Boil.
Finally add a coconut oil and garlic tadka and serve.`,
      },
      {
        h: "Version 2",
        ing: `Raw mango
Water, salt, turmeric powder, chopped green chillies, jaggery
Ghee and garlic`,
        steps: `Wash and chop the raw mango and grind to a fine paste.
Make a garlic tadka with ghee in a kadhai, then add the raw mango paste.
Add the required water, salt, turmeric, green chillies and jaggery and boil.
Serve with hot rice.`,
      },
    ],
  },

  /* ───────────── CURRY › KADHI ───────────── */
  {
    id: "onion-kadhi", title: "Onion Kadhi", cat: "curry", sub: "Kadhi", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `2 tbsp grated coconut
1/4 tsp red chilli powder
1 medium Vattambe sol
Salt
1/4 small onion`,
      steps: `Grind the coconut, red chilli powder, Vattambe sol and salt.
Lastly add the onion, grind a little more and serve.`,
    }],
  },
  {
    id: "onion-kafi", title: "Onion Kafi", cat: "curry", sub: "Kadhi", by: "Amma", date: "2025-07-07",
    parts: [{
      ing: `Grated coconut
Salt, red chilli powder
1–2 Vattambe sol (depending on size)
1/4 or 1/2 onion, chopped (depending on size)`,
      steps: `Grind the coconut, salt, red chilli powder and Vattambe sol.
When 80% done, add the chopped onion and grind further. Ready to serve.`,
    }],
  },
  {
    id: "kokum-kadhi", title: "Kokum Kadhi", cat: "curry", sub: "Kadhi", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `2 tbsp grated coconut
Salt
2 kokum
2 shallow-fried green chillies
Garlic (tadka)`,
      steps: `Grind the coconut, salt, kokum and fried green chillies.
Make a garlic tadka and add it to the ground mixture.
Boil and serve.`,
    }],
  },
  {
    id: "sol-kadhi", title: "Sol Kadhi", cat: "curry", sub: "Kadhi", by: "Amma", date: "2026-06-18",
    parts: [{
      ing: `Green chillies
Garlic pods
Kokum petals
Coconut milk
Salt, coriander leaves`,
      steps: `Grind the green chillies, garlic and kokum petals into a fine paste.
Add the coconut milk and salt to taste.
Garnish with chopped coriander leaves and serve chilled.`,
    }],
  },
  {
    id: "jeere-meere-kadhi", title: "Jeere Meere Kadhi", cat: "curry", sub: "Kadhi", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `Ghee
4–5 white pepper, coriander seeds, jeera
4–5 tbsp grated coconut
Turmeric, salt, tamarind paste
Garlic (tadka)`,
      steps: `Heat ghee and fry the white pepper, coriander seeds and jeera separately.
Grind them with the coconut, turmeric, salt and tamarind paste.
Make a garlic tadka, add it to the paste and boil. Serve hot.`,
    }],
  },
  {
    id: "majige-huli", title: "Majige Huli", cat: "curry", sub: "Kadhi", by: "Me", date: "2025-07-26",
    parts: [{
      ing: `2–3 roasted chillies
Coconut, haldi
0.5 tsp jeera
1 tsp chana dal, soaked
Garlic
0.5 tsp khus khus
Moge (cucumber), salt`,
      steps: `Cook the moge (2 whistles).
Grind everything except the chana dal first, then add the chana dal and grind.
Add only salt, then add the moge and masala together.`,
    }],
  },

  /* ───────────── CURRY › TAMBLI ───────────── */
  {
    id: "pudina-tambli", title: "Pudina Tambli", cat: "curry", sub: "Tambli", by: "Amma", date: "2025-06-20",
    parts: [{
      ing: `Pudina
Fried green chillies
Salt
Curd
Optional tadka – ghee, mustard seeds, curry leaves`,
      steps: `Grind the pudina, fried green chillies and salt and mix with curd.
If you want, add a tadka of ghee, mustard seeds and curry leaves – but cool it before adding.`,
    }],
  },

  /* ───────────── CURRY › DAL ───────────── */
  {
    id: "dalitoy", title: "Dalitoy", cat: "curry", sub: "Dal", by: "Amma", date: "2025-06-19",
    parts: [
      {
        h: "Version 1",
        ing: `3 tbsp tuar dal
Potato, chopped
2–3 tbsp grated coconut, turmeric, 1/4 tsp jeera, 2–3 garlic pods
Tomato, capsicum, 3 green chillies (chopped)
Salt
Tadka – oil, mustard seeds, hing
Coriander leaves`,
        steps: `Boil the tuar dal and make a paste. Boil the chopped potato.
Grind the coconut, turmeric, jeera and garlic.
Add the tomato, capsicum and green chillies to the boiled potato along with the ground paste. Add salt and boil.
Make a tadka of oil, mustard seeds and hing and add it with the coriander leaves. Ready to serve.`,
      },
      {
        h: "Version 2 (Nov 2026)",
        ing: `4 tbsp tuar dal (boiled with 1 tsp oil and a pinch of turmeric)
1 potato, cubed
2–3 tbsp grated coconut, a pinch of turmeric, 1/2 tsp jeera, 5–6 garlic cloves
Salt, chopped green chillies, tomato, capsicum
Seasoning – mustard, curry leaves, hing
Coriander leaves`,
        steps: `Boil the tuar dal with oil and turmeric. Cool, mash and keep aside. Boil the cubed potato.
Grind the coconut, turmeric, jeera and garlic nicely.
Add this paste and the mashed dal to the boiled potato. Add salt, green chillies, tomato and capsicum and boil.
Add the mustard, curry leaves and hing seasoning. Add chopped coriander leaves and serve hot.`,
      },
    ],
  },
  {
    id: "varn", title: "Varn", cat: "curry", sub: "Dal", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `3 tbsp tuar dal
1 tbsp moong dal
2 chopped chillies
Salt, turmeric powder
Tadka – ghee, mustard seeds, jeera, hing
Coriander leaves`,
      steps: `Boil the tuar dal with the moong dal and make a paste.
Add the chopped chillies, salt and turmeric and boil.
Add a tadka of ghee, mustard seeds, jeera and hing.
Add chopped coriander leaves before serving.`,
    }],
  },
  {
    id: "dal-milavat", title: "Dal Milavat", cat: "curry", sub: "Dal", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `3 tbsp tuar dal
1½ tbsp moong dal
1/2 tsp chana dal
1/4 tsp urad dal
3 green chillies
Turmeric powder, salt
Ghee, jeera, garam masala powder
Coriander leaves`,
      steps: `Boil all the dals with the green chillies. Cool and remove 2 chillies.
Grind coarsely. Add turmeric and salt and boil.
Heat ghee, add jeera, switch off and add garam masala powder.
Add the tadka to the dal and serve hot with chopped coriander leaves.`,
    }],
  },

  /* ───────────── SIDE DISHES › SASAM ───────────── */
  {
    id: "raw-mango-sasam", title: "Raw Mango Sasam", cat: "sides", sub: "Sasam", by: "Amma", date: "2025-06-18",
    parts: [{
      ing: `Raw mangoes
Salt, jaggery, red chilli powder`,
      steps: `Boil the raw mangoes and remove the pulp.
Add salt, jaggery and red chilli powder to taste.`,
    }],
  },
  {
    id: "ripe-mango-sasam", title: "Ripe Mango Sasam with Coconut", cat: "sides", sub: "Sasam", by: "Amma", date: "2025-06-18",
    parts: [{
      ing: `Ripe mangoes
Grated coconut, turmeric, salt, red chilli powder
7–8 raw mustard seeds
Jaggery powder, coconut oil`,
      steps: `Boil the ripe mangoes and let them cool.
Grind the coconut, turmeric, salt, red chilli powder and raw mustard.
Add this to the mangoes. Add jaggery powder and coconut oil.
Adjust salt, jaggery and red chilli powder to taste.`,
    }],
  },
  {
    id: "maddi-sasam", title: "Colocasia Root (Maddi) Sasam", cat: "sides", sub: "Sasam", by: "Amma", date: "2026-01-11",
    parts: [{
      ing: `Maddi, chopped
Salt, tamarind paste
Red chilli powder, 4–5 raw mustard seeds
A petal of Vattambe sol
Grated coconut
Coconut oil (optional)`,
      steps: `Wash and boil the chopped maddi with salt and tamarind paste and let it cool.
Grind the red chilli powder, raw mustard, salt, Vattambe sol and coconut.
Add this once the maddi has cooled.
Add a spoon of coconut oil if you like.`,
    }],
  },
  {
    id: "ambade-sasam", title: "Amate Kayi (Ambade) Sasam", cat: "sides", sub: "Sasam", by: "Amma", date: "2026-06-26",
    parts: [{
      ing: `Ambade
Grated coconut, red chilli powder, salt
1/4 tsp raw mustard seeds
Jaggery
1 tsp coconut oil
Amchur powder (if needed)`,
      steps: `Boil and mash the ambade.
Grind the coconut with red chilli powder, salt and raw mustard.
Add this paste and jaggery to the boiled ambade.
Add a tsp of coconut oil for flavour. Check the taste before serving.`,
    }],
    tips: `If the ambade aren't sour, add a tsp of amchur powder.`,
  },

  /* ───────────── SIDE DISHES › SABJI ───────────── */
  {
    id: "tender-bamboo-sukke", title: "Tender Bamboo Sukke", cat: "sides", sub: "Sabji", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `A fistful of green peas, soaked overnight
Tender bamboo, chopped
Turmeric, 1/2 tsp red chilli powder
1/2 tsp chana dal, coriander seeds
Less than 1/4 tsp fried methi seeds, urad dal, mustard seeds
4–5 tbsp grated coconut, 1/4 onion
4–5 garlic, chopped; onion; curry leaves
Salt, 2 Vattambe sol`,
      steps: `Wash and boil the soaked green peas with the chopped bamboo.
Grind turmeric, red chilli powder, chana dal, coriander seeds, methi, urad dal and mustard seeds. Then add the coconut and 1/4 onion.
Heat oil, fry the chopped garlic. Add chopped onion and curry leaves.
Add the boiled peas and bamboo. Add salt and Vattambe sol and boil.
Switch off when the extra water dries.`,
    }],
  },
  {
    id: "sukke", title: "Sukke (my notes)", cat: "sides", sub: "Sabji", by: "Me", date: "2025-07-26",
    parts: [{
      ing: `Masala – chana dal ~1 tsp, urad dal 0.5 tsp, methi 1/3 tsp, mustard 1/3 tsp, coriander 1 full tsp
Haldi, red chilli powder, coconut, 1/4 onion
Onion, garlic, curry leaves
Veggies
Sol, jaggery, salt`,
      steps: `Dry grind the chana dal, urad dal, methi, mustard and coriander till fine.
Then grind coarsely with haldi, red chilli powder, coconut and quarter onion.
Roast onion, garlic and curry leaves, add the veggies and water.
Once boiled, add sol, jaggery and salt.
After about 5 minutes, add the masala.`,
    }],
  },
  {
    id: "ghanshe", title: "Ghanshe (with Dried Prawns)", cat: "sides", sub: "Sabji", by: "Me", date: "2025-09-14",
    parts: [{
      ing: `Veggies – moolangi, padwale, maddi, navilkosu, cabbage or potato
Onions, garlic
Dried prawns
Coconut, haldi, red chilli powder, onion, 0.5 tsp coriander`,
      steps: `Fry onions and garlic, add the chopped veggies and cook till 60–70% done.
Wash the dried prawns and remove the sand.
Grind coconut, haldi, red chilli powder, onion and coriander.
Add the masala to the veggies along with the prawns. They cook fast – the prawns will become plump.`,
    }],
  },
  {
    id: "navilkosu-dal-sabji", title: "Navilkosu (Kohlrabi) & Tuar Dal Sabji", cat: "sides", sub: "Sabji", by: "Amma", date: "2026-02-11",
    parts: [{
      ing: `Navilkosu, peeled and grated
Tuar dal, boiled
Mustard, jeera, hing
Curry leaves, onion
Turmeric, red chilli powder, salt
Grated coconut`,
      steps: `Wash, peel and grate the navilkosu. Boil the tuar dal.
Heat oil, add a mustard, jeera and hing tadka.
Add chopped curry leaves and onion, the grated navilkosu, cooked dal, turmeric, red chilli powder, salt and coconut.
Cook till the navilkosu becomes soft. Don't add much water, as the dal and navilkosu contain water.`,
    }],
    tips: `Tastes best with chapati or jowar roti.`,
  },
  {
    id: "dry-zunka", title: "Dry Zunka", cat: "sides", sub: "Sabji", by: "Amma", date: "2025-09-02",
    parts: [{
      ing: `3–4 tbsp besan
Capsicum or spring onion or fenugreek leaves or palak
Onion, garlic
Mustard seeds, jeera, hing
Turmeric, chilli powder, 1/2 tsp sugar, salt
3–4 tbsp oil`,
      steps: `Dry roast the besan. Finely chop the onion, garlic and the vegetable you are using.
Heat oil, add mustard seeds, jeera, garlic, hing and (if using) the spring onion bulbs and fry a little.
Add turmeric, chilli powder, sugar, salt and the chopped vegetable. Add the besan along with the chopped greens. Mix thoroughly.
Sprinkle a few drops of water and 3–4 tbsp oil and close the lid.
After a few minutes mix again. Remove from the gas once the colour changes and the vegetables are fully cooked.`,
    }],
    tips: `Even when using spring onion, add normal chopped onion too – otherwise it looks like a green leaf sabji with mashed dal.`,
  },
  {
    id: "stuffed-ridgegourd", title: "Stuffed Ridge Gourd", cat: "sides", sub: "Sabji", by: "Amma", date: "2026-11-07",
    parts: [{
      ing: `Ridge gourds
Red chilli powder, turmeric powder, garlic pods
2–3 tbsp fried white til
1 tbsp fried chana dal, 1/2 tsp fried urad dal
1 tsp fried coriander seeds, 1/4 tsp fried mustard seeds, a little fried methi
1/2 tbsp jeera
Jaggery, tamarind paste, salt
Fried and peeled groundnuts
Chopped onion and coriander leaves`,
      steps: `Lightly peel and cut the ridge gourds.
Grind all the spices, til, dals, jaggery, tamarind and salt. Finally add the groundnuts and make a coarse paste.
Add chopped onion and coriander leaves to the paste and stuff it into the ridge gourd pieces.
Sprinkle oil, cover, shallow fry and serve hot.`,
    }],
  },
  {
    id: "tomato-gojju", title: "Tomato Gojju", cat: "sides", sub: "Sabji", by: "Amma", date: "2025-07-05",
    parts: [{
      ing: `1–2 green chillies (depending on heat and size)
Tomatoes
2 onions, finely chopped
Sugar, salt
A very little red chilli powder (for colour)`,
      steps: `Shallow fry the green chillies. Chop the tomatoes and grind with the green chillies.
Heat oil, add the onions and fry till light pink.
Add the ground paste, sugar, salt and red chilli powder and boil till it thickens.`,
    }],
    tips: `Tastes good with chapati.`,
  },
  {
    id: "palak-paneer", title: "Palak Paneer", cat: "sides", sub: "Sabji", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `Palak
A little sugar, an ice cube, green chillies
Paneer cubes
Onions and tomatoes (separate purees)
Ginger garlic paste
Turmeric, red chilli powder, garam masala, dhaniya powder, jeera powder, kitchen king masala
Sugar, salt, 1 tbsp ghee`,
      steps: `Wash, chop and steam the palak. Cool and grind with a little sugar, an ice cube and green chillies.
Boil water, add the paneer cubes and cook till soft.
Make separate purees of onions and tomatoes.
Heat oil, add the onion paste and ginger garlic paste and fry. Then add the tomato puree and fry.
Add all the masala powders, sugar and salt.
Add the palak paste, paneer cubes and ghee and boil. Serve hot.`,
    }],
  },
  {
    id: "methi-paneer", title: "Methi Paneer", cat: "sides", sub: "Sabji", by: "Amma", date: "2025-07-28",
    parts: [{
      ing: `Methi leaves, finely chopped
Onions and tomatoes, finely chopped
Paneer cubes
Jeera, 1 tsp ginger garlic paste
Turmeric, red chilli powder, garam masala, coriander-cumin powder, kitchen king masala
Sugar, salt`,
      steps: `Put the paneer cubes in hot water and mash.
Heat oil, add jeera, onions, tomatoes and ginger garlic paste.
Add the methi leaves and fry till mushy – this reduces the bitterness.
Add all the masala powders, sugar and salt and fry till aromatic.
Add the mashed paneer and mix thoroughly.
Keep on sim and switch off after ten minutes.`,
    }],
  },

  /* ───────────── SIDE DISHES › STIR FRY ───────────── */
  {
    id: "papaya-bhaji", title: "Papaya Stir Fry (Bhaji)", cat: "sides", sub: "Stir Fry", by: "Amma", date: "2025-06-19",
    parts: [{
      ing: `Raw papaya
Oil, mustard seeds, curry leaves
Sugar, salt
Grated coconut`,
      steps: `Peel and chop the papaya.
Make a tadka of oil, mustard seeds and curry leaves and add the papaya.
Add sugar, salt and grated coconut and cook. Serve hot.`,
    }],
  },
  {
    id: "radish-talasan", title: "Radish (Mulangi) Talasan", cat: "sides", sub: "Stir Fry", by: "Amma", date: "2025-07-01",
    parts: [{
      ing: `Radish, peeled and grated
Garlic pods
Oil, coconut oil
Salt, red chilli powder`,
      steps: `Heat oil, add the garlic pods.
When they turn golden brown, add the grated radish and fry till the water reduces by a quarter.
Add coconut oil, salt and red chilli powder to taste and serve.`,
    }],
  },
  {
    id: "sweet-potato-upkari", title: "Sweet Potato Upkari", cat: "sides", sub: "Stir Fry", by: "Amma", date: "2026-03-29",
    parts: [{
      ing: `Sweet potatoes, cubed
Mustard seeds, jeera, onion, curry leaves, split green chillies, hing
Salt, sugar
1/2 cup water
Grated coconut
Cashews (optional)`,
      steps: `Wash and cube the sweet potatoes.
Heat oil, add mustard seeds (and cashews, if using), jeera, onion, curry leaves, green chillies and hing and fry.
Add the sweet potatoes, salt, sugar and half a cup of water. Don't add more water at the start or it may turn mushy.
Cover and cook, adding water only if necessary.
Finally add grated coconut and serve.`,
    }],
  },
  {
    id: "mushroom-butter-garlic", title: "Mushroom Butter Garlic", cat: "sides", sub: "Stir Fry", by: "Amma", date: "2025-07-08",
    parts: [{
      ing: `Butter
Garlic (be generous)
1 tsp corn flour
A pinch of pasta spice mix
Mushrooms, chopped
Salt, chilli flakes
Coriander`,
      steps: `Add butter – don't let it burn.
Add garlic and fry till light brown and fragrant.
Add the corn flour and roast it.
Add a pinch of pasta spice mix.
Add the mushrooms and cover. Mushrooms release a lot of water, so roast till it is absorbed.
Add salt to taste and chilli flakes.
Garnish with coriander.`,
    }],
  },

  /* ───────────── CHUTNEYS & PICKLES ───────────── */
  {
    id: "coconut-chutney", title: "Coconut Chutney (and Pudina Chutney)", cat: "chutney", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `4 tbsp grated coconut
Salt
A small piece of mango sol
Fried green chillies, garlic pods
6–7 puthani (roasted chana)
Coriander leaves`,
      steps: `Grind the coconut, salt, mango sol, fried green chillies and garlic.
Add the puthani and grind further.
Lastly add coriander leaves and run the mixer in pulse mode.`,
    }],
    tips: `Adding 2–3 curry leaves and ginger while grinding tastes good occasionally.
For Pudina Chutney: add only fried green chillies and garlic – no curry or coriander leaves.`,
  },
  {
    id: "tomato-chutney", title: "Tomato Chutney", cat: "chutney", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `3–4 tbsp grated coconut
1/4 tsp sugar, 1/2 tsp salt
3–4 garlic pods
1 small onion, chopped
1/2 tomato, chopped
Red chilli powder`,
      steps: `Grind the coconut with the sugar and salt.
Heat oil, fry the garlic, onion and tomato.
Lastly add red chilli powder and switch off.
Let it cool, add it to the coconut paste and grind further.`,
    }],
  },
  {
    id: "ginger-chutney", title: "Red (Ginger) Chutney", cat: "chutney", by: "Amma", date: "2025-06-21",
    parts: [{
      ing: `3–4 garlic pods
A small piece of ginger
Grated coconut
Red chilli powder, salt, a little sugar
Lemon juice`,
      steps: `Shallow fry the garlic and ginger and let them cool.
Add them to the grated coconut with red chilli powder, salt and a little sugar and grind.
Finally add a few drops of lemon juice and serve.`,
    }],
    tips: `Best with plain Neer dosa.`,
  },
  {
    id: "thecha", title: "Thecha", cat: "chutney", by: "Amma", date: "2025-06-21",
    parts: [
      {
        h: "Amma's version",
        ing: `Green chillies, garlic
Salt, tamarind paste
Groundnuts, jaggery
Coriander leaves`,
        steps: `Shallow fry the green chillies and garlic.
Grind coarsely with salt, tamarind paste, groundnuts, jaggery and coriander leaves.`,
      },
      {
        h: "Tarla Dalal's version",
        ing: `Green chillies, peeled garlic pods
Salt, jaggery, tamarind paste
Coriander leaves
Roasted, peeled groundnuts`,
        steps: `Shallow fry the green chillies and garlic.
Grind coarsely with salt, jaggery, tamarind paste, coriander leaves and groundnuts.
Serve with hot parathas or jowar rotis.`,
      },
    ],
  },
  {
    id: "curry-leaves-chutney", title: "Curry Leaves Chutney", cat: "chutney", by: "Amma", date: "2026-03-18",
    parts: [{
      ing: `Peeled garlic
Curry leaves
Dry coconut
Red chilli powder, salt
Tamarind paste, jaggery`,
      steps: `Fry the garlic and curry leaves and let them cool.
Grind with dry coconut, red chilli powder, salt, tamarind paste and jaggery.`,
    }],
    tips: `Use as a side dish or mix with hot rice and ghee.
Keeps for a week in the fridge.`,
  },
  {
    id: "ridge-gourd-peel-chutney", title: "Ridge Gourd Peel Chutney", cat: "chutney", by: "Me", date: "2026-11-12",
    parts: [{
      ing: `Ridge gourd peel, chopped
5–6 garlic pods
2–3 green chillies
Curry leaves, 1/4 onion
Salt, tamarind paste, jaggery
Coriander leaves, groundnuts`,
      steps: `Heat oil, fry the ridge gourd peel, garlic, green chillies, curry leaves and onion till golden brown. Let it cool.
In a mixer jar add salt, tamarind paste, jaggery, coriander leaves and groundnuts.
Add the cooled items and grind coarsely.`,
    }],
    tips: `Serve with rice or chapati.`,
  },
  {
    id: "brinjal-chutney", title: "Brinjal Chutney", cat: "chutney", by: "Me", date: "2026-11-12",
    parts: [{
      ing: `1 tbsp chana dal, 1/2 tsp urad dal
4–5 garlic, curry leaves
A pinch of jaggery, salt, tamarind paste
2 brinjals, chopped; a pinch of turmeric
Coriander leaves
Mustard seeds, curry leaves (seasoning)`,
      steps: `Fry the chana dal, urad dal, garlic and curry leaves. Cool and grind with jaggery, salt and tamarind paste.
Fry the brinjal with turmeric till soft. Cool and grind with coriander leaves. Don't add water.
Heat oil again, add mustard seeds and curry leaves.
Add the ground paste and fry till the raw smell goes.`,
    }],
    tips: `Serve with rice or chapati.`,
  },
  {
    id: "red-bell-pepper-chutney", title: "Red Bell Pepper Chutney", cat: "chutney", by: "Me", date: "2026-07-11",
    parts: [{
      ing: `Red bell pepper
Onions
4–5 garlic cloves
1/4 tsp sugar, chilli powder, salt
Coriander`,
      steps: `Roast the red bell pepper, peel and keep aside.
Chop the onions.
Fry the garlic, onions, roasted bell pepper, sugar, chilli powder and salt.
Cool, add coriander and grind coarsely. Ready to serve.`,
    }],
  },
  {
    id: "dry-prawns-chutney", title: "Dry Prawns Chutney", cat: "chutney", by: "Me", date: "2025-09-14",
    parts: [{
      ing: `Dried prawns
Grated coconut
Red chilli powder, salt
Chopped onions
Coconut oil`,
      steps: `Wash the prawns and fry lightly on a low flame.
Add grated coconut, red chilli powder, salt, chopped onions and coconut oil.
Mix thoroughly.`,
    }],
  },
  {
    id: "mango-palu", title: "Mango Palu (Pickle)", cat: "chutney", by: "Amma", date: "2025-10-06",
    parts: [{
      ing: `Roasted methi seeds – 3–4 tsp
Roasted mustard seeds – 5–6 tsp
2 medium tender mangoes, cut into chunks
Jaggery – half a bowl
Salt to taste
Curry leaves – 8–10
Hing powder – 1 tsp
A pinch of haldi
Kashmiri lal chilli powder – 5 heaped tsp
Oil – 3 tsp`,
      steps: `Grind the roasted methi and mustard seeds to a fine powder. Set aside.
Heat oil, add a tsp of mustard seeds and the curry leaves. When the seeds splutter, add hing and haldi. Stir.
Add 1 cup of water and the mango chunks. Add salt. Cook until the mango pieces are slightly soft.
Add the Kashmiri chilli powder and the methi–mustard powder. Mix well.
Add the jaggery and cook on a low flame for 10 minutes.`,
    }],
    tips: `Doesn't need to be refrigerated for almost a week.
Recipe by Vina Vinanti Gouri (went viral in VCD).`,
  },

  /* ───────────── SWEETS ───────────── */
  {
    id: "rice-kheer", title: "Rice Kheer", cat: "sweets", by: "Me", date: "2026-11-12",
    parts: [{
      ing: `1 cup rice
1 cup milk + 1 cup water
Sugar and cardamom (powdered)
Condensed milk
Dry fruits – cashews, pistachio, almonds, pumpkin seeds`,
      steps: `Cook the rice with the milk and water. Cool, mash and keep aside.
Powder sugar with cardamoms to taste.
Add it to the mashed rice with the condensed milk and chopped dry fruits and boil again. Ready to serve.`,
    }],
    tips: `When adding the condensed milk, remember you have already added powdered sugar.`,
  },
];

/* Online references: YouTube and website links from the chat (Facebook and Instagram left out). */
const LINKS = [
  { id: "l-dum-aloo", title: "Punjabi Dum Aloo (Dum Baby Aloo)", url: "https://www.vegrecipesofindia.com/punjabi-dum-aloo/", by: "Me", date: "2022-01-11" },
  { id: "l-kadai-mushroom", title: "Kadai Mushroom Gravy", url: "https://www.indianhealthyrecipes.com/kadai-mushroom-gravy-recipe/", by: "Amma", date: "2022-10-21" },
  { id: "l-thili-saaru", title: "Thili Saaru / Rasam & rasam powder (Kannada)", url: "https://kannada.hindustantimes.com/photos/recipe-news-in-kannada-how-to-prepare-thili-saaru-or-rasam-recipe-rasam-powder-making-devasthana-saaru-iyengar-rasam-mnk-181688305942425.html", by: "Amma", date: "2023-07-03" },
  { id: "l-yt-6cDyr4ncn3g", title: "YouTube video (no name in chat)", url: "https://youtube.com/watch?v=6cDyr4ncn3g", by: "Amma", date: "2023-09-17" },
  { id: "l-yt-fu1yPcXlImI", title: "YouTube video (no name in chat)", url: "https://youtu.be/fu1yPcXlImI", by: "Me", date: "2024-04-15" },
  { id: "l-yt-uqjPJA6YHW8", title: "YouTube video (no name in chat)", url: "https://youtu.be/uqjPJA6YHW8", by: "Amma", date: "2024-05-01" },
  { id: "l-mango-pom-chutney", title: "Mango Pomegranate Chutney", url: "https://www.food.com/recipe/mango-pomegranate-chutney-526092", by: "Me", date: "2024-05-21", note: "Vinegar is mostly not required. Jaggery can be used instead of brown sugar." },
  { id: "l-pulissery", title: "Pulissery (Onam Sadya)", url: "https://www.cookingandme.com/pulissery-recipe-pulissery-onam-sadya-recipe/", by: "Amma", date: "2024-08-12" },
  { id: "l-tomato-kurma", title: "Tomato Kurma", url: "https://www.slurrp.com/web-stories/tomato-kurma-a-rich-and-flavourful-south-indian-curry-for-dinner/", by: "Amma", date: "2025-04-28" },
  { id: "l-yt-rA62FQpdkCU", title: "YouTube video (no name in chat)", url: "https://youtu.be/rA62FQpdkCU", by: "Amma", date: "2025-06-23" },
  { id: "l-rava-uttapam", title: "Quick Rava Uttapam", url: "https://www.slurrp.com/web-stories/quick-rava-uttapam-recipe-easy-south-indian-breakfast-in-minutes/", by: "Amma", date: "2025-07-15" },
  { id: "l-veg-kurma", title: "Veg Kurma (made in Bangalore)", url: "https://www.indianhealthyrecipes.com/veg-kurma-recipe-vegetable-korma-recipe/", by: "Amma", date: "2025-07-24" },
  { id: "l-fry-idli", title: "Tamil Nadu Street-style Fry Idli (Kannada)", url: "https://share.google/swsUmTUVO2hYZQmkM", by: "Amma", date: "2025-07-29" },
  { id: "l-yt-yCGo9K-ejXI", title: "YouTube video (no name in chat)", url: "https://youtu.be/yCGo9K-ejXI", by: "Amma", date: "2025-08-24" },
  { id: "l-jackfruit-mulka", title: "Jackfruit Mulka", url: "https://youtu.be/gH0xyyePsHM", by: "Amma", date: "2025-09-29" },
  { id: "l-cucumber-vadape", title: "Cucumber Masala Vadape (Havyak style)", url: "https://youtu.be/BZuXlWh9-BQ", by: "Amma", date: "2025-10-29" },
  { id: "l-pineapple-menaskayi", title: "Pineapple Menaskayi (Gojju)", url: "https://hebbarskitchen.com/pineapple-curry-pineapple-gojju-menaskai/", by: "Amma", date: "2026-02-11" },
  { id: "l-soppu-saaru", title: "Soppu Saaru (Radish Leaves Saaru)", url: "https://hebbarskitchen.com/soppu-saaru-recipe-radish-leaves-saaru/", by: "Amma", date: "2026-02-11" },
  { id: "l-sante-bonda", title: "Sante Bonda (ಸಂತೆ ಬೊಂಡಾ)", url: "https://youtu.be/jFd8IEsftRE", by: "Amma", date: "2026-02-24" },
  { id: "l-dudh-cold", title: "Dudh Cold", url: "https://youtu.be/fiuw_V5p4cA", by: "Amma", date: "2026-05-14" },
  { id: "l-yt-SwVuEA7RD0E", title: "YouTube video (no name in chat)", url: "https://youtu.be/SwVuEA7RD0E", by: "Me", date: "2026-07-20" },
  { id: "l-garlic-chutney", title: "Rajasthani Garlic Chutney (Kannada)", url: "https://kannada.news18.com/news/chitradurga/rajasthani-garlic-chutney-easy-method-here-bmp-svl-local18-ws-l-2480731.html", by: "Amma", date: "2026-09-01" },
  { id: "l-menthe-tambuli", title: "Menthe Tambuli – Hebbar's Kitchen (search online)", url: "https://hebbarskitchen.com/?s=menthe+tambuli", by: "Amma", date: "2025-06-19", note: "Amma said: recipe courtesy Hebbar's Kitchen. No link was shared – this opens a search." },
  { id: "l-amla-pickle", title: "Gooseberry (Amla) Pickle – Madhura Recipes (search online)", url: "https://www.youtube.com/results?search_query=madhura+recipes+amla+pickle", by: "Amma", date: "2022-11-17", note: "Only the name was shared – this opens a YouTube search." },
];
