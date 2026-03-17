import { createContext, useContext } from "react";

export const GRADES = ["K-2", "3-5", "7-8"];
export const GradeContext = createContext("3-5");
export const useGrade = () => useContext(GradeContext);
