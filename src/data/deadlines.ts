export type Deadline = {
  id: string;
  date: string; // ISO
  title: string;
  region: string;
};

const year = new Date().getFullYear();

export const DEADLINES: Deadline[] = [
  {
    id: "1",
    date: `${year}-10-15`,
    title: "Приём заявок на весенний семестр в Европу",
    region: "Европа",
  },
  {
    id: "2",
    date: `${year}-11-01`,
    title: "Дедлайн подачи документов в Сеульский национальный университет",
    region: "Южная Корея",
  },
  {
    id: "3",
    date: `${year}-11-20`,
    title: "Закрытие приёма на программу Erasmus+",
    region: "Европа",
  },
  {
    id: "4",
    date: `${year}-12-01`,
    title: "Подача мотивационных писем в Канадские вузы",
    region: "Канада",
  },
  {
    id: "5",
    date: `${year}-12-15`,
    title: "Регистрация на IELTS для летних программ",
    region: "Международное",
  },
  {
    id: "6",
    date: `${year + 1}-01-10`,
    title: "Приём на летний семестр в Сингапуре и НУ",
    region: "Азия",
  },
  {
    id: "7",
    date: `${year + 1}-02-01`,
    title: "Финальная подача документов на стипендии DAAD",
    region: "Германия",
  },
  {
    id: "8",
    date: `${year + 1}-03-15`,
    title: "Дедлайн заявок на осенний семестр в Европе",
    region: "Европа",
  },
];