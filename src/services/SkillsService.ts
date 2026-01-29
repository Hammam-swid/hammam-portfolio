import axios from "axios";
import type { Skill } from "../types";

/**
 * Service class for managing skills data
 */
export class SkillsService {
  private static readonly BASE_URL = "/data/skills.json";

  /**
   * Fetch all skills
   * @returns Promise<Skill[]>
   */
  static async getAll(): Promise<Skill[]> {
    try {
      const response = await axios.get<Skill[]>(this.BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching skills:", error);
      throw new Error("Failed to load skills");
    }
  }

  /**
   * Fetch skills by category
   * @param category - Skill category
   * @returns Promise<Skill[]>
   */
  static async getByCategory(category: Skill["category"]): Promise<Skill[]> {
    try {
      const skills = await this.getAll();
      return skills.filter((skill) => skill.category === category);
    } catch (error) {
      console.error(`Error fetching ${category} skills:`, error);
      throw new Error(`Failed to load ${category} skills`);
    }
  }

  /**
   * Fetch skill by ID
   * @param id - Skill ID
   * @returns Promise<Skill | undefined>
   */
  static async getById(id: string): Promise<Skill | undefined> {
    try {
      const skills = await this.getAll();
      return skills.find((skill) => skill.id === id);
    } catch (error) {
      console.error(`Error fetching skill ${id}:`, error);
      throw new Error(`Failed to load skill ${id}`);
    }
  }
}
