# Kitchen ERP - Foydalanuvchi Qo'llanmasi

Ushbu loyiha oshxona va restoranlar uchun mo'ljallangan boshqaruv tizimi (ERP) hisoblanadi. Tizim orqali mahsulotlar, ombor qoldiqlari, kassa kirim-chiqimlari, xodimlar va ularning maoshlarini oson boshqarish mumkin.

Quyida har bir sahifa va undagi ma'lumotlar nima uchun kerakligi batafsil tushuntirilgan.

---

## 1. Bosh sahifa (Dashboard)
Tizimga kirganda ochiladigan asosiy sahifa. Bu yerda biznesingizning umumiy holati ko'rsatiladi.

- **Statistika kartalari**: Bugungi savdo, xarajat va sof foyda.
- **Grafiklar**: Oylik va yillik moliyaviy o'zgarishlarni ko'rishingiz mumkin.

---

## 2. Mahsulotlar (Items)
Bu sahifada omborda ishlatiladigan barcha mahsulotlar va xom-ashyolar ro'yxati shakllantiriladi.

**Yangi mahsulot qo'shish oynasi**:
- **Nomi**: Mahsulotning nomi (masalan: Kartoshka, Go'sht, Salfetka).
- **Mahsulot turi**:
    - *Ingredient (Masalliq)*: Ovqat tayyorlash uchun ishlatiladigan mahsulotlar.
    - *Ta'minot*: Doimiy kerak bo'ladigan xo'jalik mollari.
    - *Tozalash vositasi*: Yuvish va tozalash uchun ishlatiladigan vositalar.
    - *Qadoqlash*: Upakovka va idishlar.
- **O'lchov turi**: Mahsulot qanday o'lchanishi (Og'irlik, Hajm yoki Soni).
- **O'lchov birligi**: kg, g, litr, dona va h.k.
- **Min. qoldiq**: Ombor qoldig'i shu miqdordan kamayib ketsa, tizim ogohlantirish beradi.
- **O'rtacha narx**: Mahsulotning taxminiy tannarxi (hisob-kitoblar uchun).

---

## 3. Ombor (Stock)
Ombordagi mahsulotlarning kirimi va chiqimi shu yerda amalga oshiriladi.

**Kirim qilish (Stock In)**:
- **Mahsulot**: Qaysi mahsulot kelganini tanlaysiz.
- **Sana**: Mahsulot kelgan sana.
- **Miqdor**: Qancha miqdorda keldi.
- **Narxi (dona)**: Bir birligi qanchadan sotib olindi (masalan, 1 kg narxi).
- **Yetkazib beruvchi**: Kimdan sotib olindi (bozor yoki firma nomi).
- **Izoh**: Qo'shimcha ma'lumot.

**Chiqim qilish (Stock Out)**:
- Mahsulot ombordan "spisat" qilinganda yoki ishlatilganda kiritiladi.

---

## 4. Kassa (Cash)
Barcha moliyaviy operatsiyalar (pul kirimi va chiqimi) shu yerda yuritiladi.

**Kirim va Chiqim turlari**:
- **Tur**: Pul kiryaptimi (Kirim) yoki chiqib ketyaptimi (Chiqim).
- **Summa**: Tranzaksiya summasi.
- **Sana**: Operatsiya bo'lgan vaqt.
- **Kategoriya**:
    - *Savdo*: Kunlik savdodan tushgan pul.
    - *Xarid*: Mahsulot sotib olish uchun ishlatilgan pul.
    - *Kommunal*: Gaz, svet, suv uchun to'lovlar.
    - *Maosh*: Xodimlarga berilgan pullar.
    - *Ijara*: Joy ijarasi uchun to'lov.

---

## 5. Xodimlar (Employees)
Ishchilar bazasi.

- **F.I.O**: Xodimning to'liq ismi.
- **Oylik maosh**: Xodim bilan kelishilgan o'zgarmas oylik summa (fiks).
- **Holat**: Xodim hozirda ishlayaptimi yoki yo'q (Faol/Nofaol).

---

## 6. Oyliklar (Salaries)
Xodimlarga maosh tarqatish va hisob-kitob qilish sahifasi.

**To'lov qo'shish**:
- **Xodim**: Kimga to'lanayotgani.
- **Oy**: Qaysi oy uchun to'lov qilinmoqda.
- **To'lov sanasi**: Pul berilgan kun.
- **To'langan summa**: Qo'liga qancha pul berildi.
- **Bonus**: Yaxshi ishi uchun qo'shimcha mukofot puli.
- **Jarima**: Kechikish yoki xato uchun ushlab qolingan pul.

---

## 7. Hisobotlar (Reports)
Tizimdagi yakuniy xulosalar.

- **Ombor qoldiqlari**: Hozirda omborda qaysi mahsulotdan qancha qolganini ko'rsatadi.
- **Kam qolgan mahsulotlar**: Tugab borayotgan mahsulotlar ro'yxati (Min. qoldiqdan kam bo'lganlar).

---

**Eslatma**:
- Barcha pul birliklari **so'mda (UZS)** ko'rsatiladi.
- Sana formati: **kun.oy.yil** (dd.MM.yyyy).
- Tizimdan to'liq foydalanish uchun avval **Mahsulotlar** va **Xodimlar** bo'limlarini to'ldirib olish tavsiya etiladi.
