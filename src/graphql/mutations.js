/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createToon = /* GraphQL */ `
  mutation CreateToon(
    $input: CreateToonInput!
    $condition: ModelToonConditionInput
  ) {
    createToon(input: $input, condition: $condition) {
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
      joinDate
      lastActive
      publicNote
      officerNote
      officerNoteAuthor
      fleet
      inFleet
      timeInFleet
      version
      createdAt
      updatedAt
    }
  }
`;
export const updateToon = /* GraphQL */ `
  mutation UpdateToon(
    $input: UpdateToonInput!
    $condition: ModelToonConditionInput
  ) {
    updateToon(input: $input, condition: $condition) {
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
      joinDate
      lastActive
      publicNote
      officerNote
      officerNoteAuthor
      fleet
      inFleet
      timeInFleet
      version
      createdAt
      updatedAt
    }
  }
`;
export const deleteToon = /* GraphQL */ `
  mutation DeleteToon(
    $input: DeleteToonInput!
    $condition: ModelToonConditionInput
  ) {
    deleteToon(input: $input, condition: $condition) {
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
      joinDate
      lastActive
      publicNote
      officerNote
      officerNoteAuthor
      fleet
      inFleet
      timeInFleet
      version
      createdAt
      updatedAt
    }
  }
`;
