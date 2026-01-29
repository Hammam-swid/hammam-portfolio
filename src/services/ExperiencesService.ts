import axios from "axios";
import type { Experience } from "../types";

/**
 * Service class for managing experience data
 */
export class ExperiencesService {
  private static readonly BASE_URL = "/data/experiences.json";

  /**
   * Fetch all experiences
   * @returns Promise<Experience[]>
   */
  static async getAll(): Promise<Experience[]> {
    try {
      const response = await axios.get<Experience[]>(this.BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching experiences:", error);
      throw new Error("Failed to load experiences");
    }
  }

  /**
   * Fetch current experience (no end date)
   * @returns Promise<Experience | undefined>
   */
  static async getCurrent(): Promise<Experience | undefined> {
    try {
      const experiences = await this.getAll();
      return experiences.find((exp) => !exp.endDate);
    } catch (error) {
      console.error("Error fetching current experience:", error);
      throw new Error("Failed to load current experience");
    }
  }

  /**
   * Fetch experience by ID
   * @param id - Experience ID
   * @returns Promise<Experience | undefined>
   */
  static async getById(id: string): Promise<Experience | undefined> {
    try {
      const experiences = await this.getAll();
      return experiences.find((exp) => exp.id === id);
    } catch (error) {
      console.error(`Error fetching experience ${id}:`, error);
      throw new Error(`Failed to load experience ${id}`);
    }
  }

  /**
   * Calculate experience duration in months
   * @param startDate - Start date (YYYY-MM format)
   * @param endDate - End date (YYYY-MM format) or undefined for current
   * @returns number - Duration in months
   */
  static getExperienceDuration(startDate: string, endDate?: string): number {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return months;
  }
}
