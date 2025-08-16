#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ServiceHelper {
  // GitHub Operations
  static async github(command: string) {
    try {
      const { stdout } = await execAsync(`gh ${command}`);
      return stdout.trim();
    } catch (error) {
      throw new Error(`GitHub command failed: ${error}`);
    }
  }

  // Supabase Operations
  static async supabase(command: string) {
    try {
      const { stdout } = await execAsync(`supabase ${command}`);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Supabase command failed: ${error}`);
    }
  }

  // Cloudflare Wrangler Operations
  static async wrangler(command: string) {
    try {
      const { stdout } = await execAsync(`wrangler ${command}`);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Wrangler command failed: ${error}`);
    }
  }

  // Playwright Browser Automation
  static async runBrowserTest(url: string, testFn: (page: any) => Promise<void>) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto(url);
      await testFn(page);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      await browser.close();
    }
  }
}

// Example usage functions
export const examples = {
  // GitHub example: Get current user
  async getCurrentGitHubUser() {
    return ServiceHelper.github('api user --jq .login');
  },

  // Supabase example: List projects
  async listSupabaseProjects() {
    return ServiceHelper.supabase('projects list');
  },

  // Cloudflare example: List workers
  async listCloudflareWorkers() {
    return ServiceHelper.wrangler('list');
  },

  // Browser test example
  async testHomepage() {
    return ServiceHelper.runBrowserTest('http://localhost:3000', async (page) => {
      const title = await page.title();
      console.log('Page title:', title);
    });
  }
};