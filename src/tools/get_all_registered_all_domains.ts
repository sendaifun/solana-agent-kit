import { findAllDomainsForTld, getAllTld, NameRecordHeader, TldParser, NameAccountAndDomain } from "@onsol/tldparser";
import { SolanaAgentKit } from "../index";

/**
 * Get all registered domains for all TLDs
 * @param agent - SolanaAgentKit instance
 * @returns Promise resolving to an array of objects containing nameAccount and domain
 */
export async function getAllRegisteredAllDomains(agent: SolanaAgentKit): Promise<NameAccountAndDomain[] | undefined> {
  //get all TLDs
  const allTlds = await getAllTld(agent.connection);
  const tdlParser = new TldParser(agent.connection);
  let domains = [];
  
  for (let tld of allTlds) {
    //get the parent name for the TLD
    const parentNameRecord = await NameRecordHeader.fromAccountAddress(
      agent.connection,
      tld.parentAccount
    );

    //get all name accounts in the TLD
    const allNameAccountsForTld = await findAllDomainsForTld(agent.connection, tld.parentAccount);

    //check parentName and the owner if they are null
    if (!parentNameRecord || !parentNameRecord.owner) return;

    //parse all name accounts in the TLD
    for (let nameAccount of allNameAccountsForTld) {
      //get domain as string without the tld
      const domain = await tdlParser.reverseLookupNameAccount(nameAccount, parentNameRecord.owner);
      domains.push({
        nameAccount: nameAccount,
        domain: `${domain}${tld.tld}`,
      });
    }
  }
  return domains;
}