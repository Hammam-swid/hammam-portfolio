import axios from "axios";
import type { Project } from "../types";

/**
 * Service class for managing project data
 */
export class ProjectsService {
  private static readonly BASE_URL = "/data/projects.json";

  /**
   * Fetch all projects
   * @returns Promise<Project[]>
   */
  static async getAll(): Promise<Project[]> {
    try {
      const response = await axios.get<Project[]>(this.BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new Error("Failed to load projects");
    }
  }

  /**
   * Fetch only featured projects
   * @returns Promise<Project[]>
   */
  static async getFeatured(): Promise<Project[]> {
    try {
      const projects = await this.getAll();
      return projects.filter((project) => project.featured);
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      throw new Error("Failed to load featured projects");
    }
  }

  /**
   * Fetch project by ID
   * @param id - Project ID
   * @returns Promise<Project | undefined>
   */
  static async getById(id: string): Promise<Project | undefined> {
    try {
      const projects = await this.getAll();
      return projects.find((project) => project.id === id);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw new Error(`Failed to load project ${id}`);
    }
  }
}
