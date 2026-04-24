export type TasbihPhrase = {
  id: string;
  text: string;
  short: string;
  target: number;
  fadl: string;
};

export const tasbihPhrases: TasbihPhrase[] = [
  {
    id: "subhanallah",
    text: "سُبْحَانَ اللَّهِ",
    short: "سبحان الله",
    target: 33,
    fadl: "تُقال بعد كل صلاة 33 مرة.",
  },
  {
    id: "alhamdulillah",
    text: "الْحَمْدُ لِلَّهِ",
    short: "الحمد لله",
    target: 33,
    fadl: "تملأ الميزان وأحب الكلام إلى الله.",
  },
  {
    id: "allahuakbar",
    text: "اللَّهُ أَكْبَرُ",
    short: "الله أكبر",
    target: 34,
    fadl: "تُقال بعد الصلاة 34 مرة لتكملة المائة.",
  },
  {
    id: "lailaha",
    text: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    short: "لا إله إلا الله",
    target: 100,
    fadl: "أفضل الذكر، كلمة التوحيد.",
  },
  {
    id: "astaghfir",
    text: "أَسْتَغْفِرُ اللَّهَ",
    short: "أستغفر الله",
    target: 100,
    fadl: "من لزم الاستغفار جعل الله له من كل هم فرجاً.",
  },
  {
    id: "salah",
    text: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    short: "الصلاة على النبي ﷺ",
    target: 100,
    fadl: "من صلى علي صلاة صلى الله عليه بها عشراً.",
  },
];
