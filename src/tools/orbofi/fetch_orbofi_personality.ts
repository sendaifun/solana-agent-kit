/**
 * Search Orbofi Personality Database
 * @param celebrity_name Name of the celebrity/character 
 * @returns Object containing the returned celebrity/character data & system prompt
 */
export async function fetchOrbofiPersonality(
  celebrity_name:String
) {
    // Temporary Orbofi search api endpoint
    const url = 'https://zgh4c6dkivy1kk-5000.proxy.runpod.net/orbofiPersonalitySearch';
    const data = {
      'query':celebrity_name
    };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseDataTmp = await response.json();
    const responseData = JSON.parse(responseDataTmp.results);

    let chatbots = responseData;

    return chatbots;
  } catch (error) {
    console.error('Error fetching chatbot list:', error);
    return [];
  }
  }
  