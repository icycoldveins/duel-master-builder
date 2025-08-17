import axios from "axios";

const YGO_API_BASE = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

export interface YugiohCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  card_sets?: Array<{
    set_name: string;
    set_rarity: string;
  }>;
  card_images: Array<{
    id: number;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
  card_prices?: Array<{
    cardmarket_price: string;
    tcgplayer_price: string;
  }>;
}

export interface SearchFilters {
  fname?: string;
  type?: string;
  race?: string;
  archetype?: string;
  attribute?: string;
  level?: number;
  atk?: number;
  def?: number;
}

class YugiohAPI {
  private cache = new Map<string, YugiohCard[]>();

  async searchCards(
    filters: SearchFilters = {},
    limit = 50,
  ): Promise<YugiohCard[]> {
    const cacheKey = JSON.stringify(filters);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.slice(0, limit);
    }

    try {
      const params = new URLSearchParams();

      if (filters.fname) params.append("fname", filters.fname);
      if (filters.type) params.append("type", filters.type);
      if (filters.race) params.append("race", filters.race);
      if (filters.archetype) params.append("archetype", filters.archetype);
      if (filters.attribute) params.append("attribute", filters.attribute);
      if (filters.level !== undefined)
        params.append("level", filters.level.toString());
      if (filters.atk !== undefined)
        params.append("atk", filters.atk.toString());
      if (filters.def !== undefined)
        params.append("def", filters.def.toString());

      const url = `${YGO_API_BASE}?${params.toString()}`;
      const response = await axios.get<{ data: YugiohCard[] }>(url);

      const cards = response.data.data || [];
      this.cache.set(cacheKey, cards);

      return cards.slice(0, limit);
    } catch (error) {
      console.error("Error fetching cards:", error);
      return [];
    }
  }

  async getCardById(id: number): Promise<YugiohCard | null> {
    try {
      const response = await axios.get<{ data: YugiohCard[] }>(
        `${YGO_API_BASE}?id=${id}`,
      );
      return response.data.data?.[0] || null;
    } catch (error) {
      console.error("Error fetching card by ID:", error);
      return null;
    }
  }

  async getRandomCards(count = 20): Promise<YugiohCard[]> {
    return this.searchCards({}, count);
  }
}

export const yugiohAPI = new YugiohAPI();
