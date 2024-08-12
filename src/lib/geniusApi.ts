import { CLIENT_ID, CLIENT_SECRET } from "$env/static/private";
import {
  ClientCredentials,
  ResourceOwnerPassword,
  AuthorizationCode,
  type AccessToken,
} from "simple-oauth2";

export default class GeniusApi {
  // singleton

  static #instance: GeniusApi;

  // auth

  #accessToken: AccessToken;

  private constructor(my_access_token: any) {
    // const client = new ClientCredentials(this.config);
    this.#accessToken = my_access_token;
  }

  static async initialize() {
    if (this.#instance) {
      // Instance already exists, so return it
      return this.#instance;
    }

    // Instance does not exist, so create it

    // Create a client object with the client id and secret
    const config = {
      client: {
        id: CLIENT_ID,
        secret: CLIENT_SECRET,
      },
      auth: {
        tokenHost: "https://api.genius.com",
      },
    };
    const client: ClientCredentials = new ClientCredentials(config);

    // Get an access token using the client object
    try {
      const tokenParams = {};
      const accessToken = await client.getToken(tokenParams);
      // Create a new instance of GeniusApi with the access token and return it
      this.#instance = new GeniusApi(accessToken.token.access_token);
      return this.#instance;
    } catch (error: any) {
      console.error("Access Token error", error.message);
      throw error;
    }
  }

  // methods the class provides for interacting with the Genius API

  async searchGenius(query: string) {
    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    // TODO: only pass the data we need
    return data;
  }

  async getArtistInfo(query: string) {
    const response = await fetch(
      `https://api.genius.com/artists/${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }
}

// TODO: method to get artist from name?
