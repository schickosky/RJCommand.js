/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getToon = /* GraphQL */ `
  query GetToon($account: String!, $character: String!) {
    getToon(account: $account, character: $character) {
      account
      character
      level
      currentRank
      maximumRank
      contribs {
        ra
        rse
        snoo
        rising
        mirror
      }
      originalJoinDate
      joinDate
      lastActive
      publicNote
      officerNote
      officerNoteAuthor
      fleet
      inFleet
      version
      createdAt
      updatedAt
    }
  }
`;
export const listToons = /* GraphQL */ `
  query ListToons(
    $account: String
    $character: ModelStringKeyConditionInput
    $filter: ModelToonFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listToons(
      account: $account
      character: $character
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        account
        character
        level
        currentRank
        maximumRank
        contribs {
          ra
          rse
          snoo
          rising
          mirror
        }
        originalJoinDate
        joinDate
        lastActive
        publicNote
        officerNote
        officerNoteAuthor
        fleet
        inFleet
        version
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const toonsByFleet = /* GraphQL */ `
  query ToonsByFleet(
    $fleet: String
    $sortDirection: ModelSortDirection
    $filter: ModelToonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    toonsByFleet(
      fleet: $fleet
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        account
        character
        level
        currentRank
        maximumRank
        contribs {
          ra
          rse
          snoo
          rising
          mirror
        }
        originalJoinDate
        joinDate
        lastActive
        publicNote
        officerNote
        officerNoteAuthor
        fleet
        inFleet
        version
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
