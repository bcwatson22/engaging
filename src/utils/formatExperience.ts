import dayjs from "dayjs";

import { careerStartDate } from "@/constants/common";

const experiencePlaceholder = /\{\{experience\}\}/g;

const getYearsOfExperience = (): string =>
  dayjs().diff(careerStartDate, "year").toString();

const formatExperience = (value: string): string =>
  value.replace(experiencePlaceholder, getYearsOfExperience());

export { formatExperience, getYearsOfExperience, experiencePlaceholder };
