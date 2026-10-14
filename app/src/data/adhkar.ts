// Authentic Adhkar Collection (Morning, Evening, After Salah, Sleep)
// Compiled from Sahih al-Bukhari, Sahih Muslim, Abu Dawud, and Hisn al-Muslim

export interface DhikrItem {
  id: string;
  category: "morning" | "evening" | "prayer" | "before_sleep" | "general";
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  repeat: number;
  source: string;
  benefit: string;
}

export const AUTHENTIC_ADHKAR: DhikrItem[] = [
  // Morning
  {
    id: "m-1",
    category: "morning",
    title: "Sayyid al-Istighfar (Master of Forgiveness)",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li fa'innahu la yaghfiru adh-dhunuba illa anta.",
    translation: "O Allah, You are my Lord, there is no deity worthy of worship except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me, and I acknowledge my sins, so forgive me, for none forgives sins except You.",
    repeat: 1,
    source: "Sahih al-Bukhari 6306",
    benefit: "Whoever recites this during the day with conviction and dies before the evening will be among the people of Paradise."
  },
  {
    id: "m-2",
    category: "morning",
    title: "Ayat al-Kursi (The Throne Verse)",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatuw-wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi-shay'im-min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa Huwal-'Aliyyul-'Azim.",
    translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that could intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    repeat: 1,
    source: "Surah Al-Baqarah 2:255 / An-Nasa'i",
    benefit: "Whoever recites this in the morning will be protected from jinn until the evening."
  },
  {
    id: "m-3",
    category: "morning",
    title: "Protection Against Harm",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahilladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
    translation: "In the name of Allah, with Whose name nothing can cause harm on earth or in the heavens, and He is the All-Hearing, the All-Knowing.",
    repeat: 3,
    source: "Abu Dawud & At-Tirmidhi (Sahih)",
    benefit: "Whoever recites this three times in the morning will not be afflicted by any unexpected harm until the evening."
  },
  {
    id: "m-4",
    category: "morning",
    title: "Satisfaction with Allah and Islam",
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration: "Radheetu billahi Rabba, wa bil-Islami deena, wa bi-Muhammadin sallallahu 'alayhi wa sallama Nabiyya.",
    translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace and blessings be upon him) as my Prophet.",
    repeat: 3,
    source: "Abu Dawud & At-Tirmidhi",
    benefit: "Allah has promised that whoever says this three times in the morning and evening, He will surely please them on the Day of Resurrection."
  },
  {
    id: "m-5",
    category: "morning",
    title: "Abundant Praise",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
    transliteration: "Subhan Allahi wa bihamdihi: 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih.",
    translation: "Glory and praise be to Allah: to the number of His creation, according to His pleasure, equal to the weight of His Throne, and the extent of His words.",
    repeat: 3,
    source: "Sahih Muslim 2726",
    benefit: "Equal in reward to hours of continuous glorification."
  },

  // Evening
  {
    id: "e-1",
    category: "evening",
    title: "Evening Declaration of Sovereignty",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in qadeer.",
    translation: "We have reached the evening and sovereignty remains Allah's; all praise is due to Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs all dominion and praise, and He has power over all things.",
    repeat: 1,
    source: "Sahih Muslim 2723",
    benefit: "A comprehensive evening confession of reliance on Allah."
  },
  {
    id: "e-2",
    category: "evening",
    title: "Seeking Refuge in Allah's Perfect Words",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi-kalimatil-lahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    repeat: 3,
    source: "Sahih Muslim 2709",
    benefit: "Protection from any venomous creatures or unseen harm throughout the night."
  },
  {
    id: "e-3",
    category: "evening",
    title: "Supplication for Well-Being and Protection",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    transliteration: "Allahumma inni as'alukal-'afiyata fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyata fi deeni wa dunyaya wa ahli wa mali. Allahummastur 'awrati wa amin raw'ati. Allahummah-fazni min bayni yadayya wa min khalfi wa 'an yameeni wa 'an shimali wa min fawqi, wa a'udhu bi-'azamatika an ughtala min tahti.",
    translation: "O Allah, I ask You for well-being in this world and the Hereafter. O Allah, I ask You for forgiveness and well-being in my religion, worldly affairs, family, and wealth. O Allah, conceal my faults and keep me safe from anxiety. O Allah, protect me from the front, behind, right, left, and above, and I seek refuge in Your greatness from being unexpectedly swallowed up from beneath me.",
    repeat: 1,
    source: "Abu Dawud & Ibn Majah (Sahih)",
    benefit: "The Prophet (ﷺ) never omitted this supplication in the morning or evening."
  },

  // After Salah
  {
    id: "p-1",
    category: "prayer",
    title: "Asking Forgiveness & Peace",
    arabic: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Astaghfirullah, Astaghfirullah, Astaghfirullah. Allahumma antas-Salamu wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
    translation: "I ask Allah for forgiveness (3 times). O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
    repeat: 1,
    source: "Sahih Muslim 591",
    benefit: "Recited immediately after giving salam at the end of prayer."
  },
  {
    id: "p-2",
    category: "prayer",
    title: "Glorification (Tasbeeh, Tahmeed, Takbeer)",
    arabic: "سُبْحَانَ اللَّهِ (٣٣) ، الْحَمْدُ لِلَّهِ (٣٣) ، اللَّهُ أَكْبَرُ (٣٣) ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x), La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in qadeer.",
    translation: "Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (33 times), None has the right to be worshipped except Allah alone, without partner; to Him belongs dominion and praise, and He has power over all things.",
    repeat: 1,
    source: "Sahih Muslim 597",
    benefit: "Whoever recites this after every prayer, their sins will be forgiven even if they were like the foam of the sea."
  },

  // Before Sleep
  {
    id: "s-1",
    category: "before_sleep",
    title: "Sleeping in Allah's Name",
    arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    transliteration: "Bismika Rabbi wada'tu janbi wa bika arfa'uh, in amsakta nafsi farhamha, wa in arsaltaha fahfazha bima tahfazu bihi 'ibadakas-salihin.",
    translation: "In Your name my Lord, I lay down my side and by You I raise it up. If You take my soul, have mercy upon it, and if You release it, protect it as You protect Your righteous servants.",
    repeat: 1,
    source: "Sahih al-Bukhari 6320 & Muslim 2714",
    benefit: "The Prophet (ﷺ) instructed to dust the bed and recite this when retiring to sleep."
  },
  {
    id: "s-2",
    category: "before_sleep",
    title: "Surah Al-Ikhlas, Al-Falaq, & An-Nas",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    transliteration: "Surah Al-Ikhlas, Al-Falaq, and An-Nas.",
    translation: "Say: He is Allah, [who is] One... Say: I seek refuge in the Lord of daybreak... Say: I seek refuge in the Lord of mankind.",
    repeat: 3,
    source: "Sahih al-Bukhari 5017",
    benefit: "Recite into cupped hands, lightly blow, and wipe over head, face, and front of body three times."
  }
];
