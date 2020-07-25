import moment from 'moment';
import { API, graphqlOperation } from 'aws-amplify';
import * as queries from './graphql/queries';

/** List of all short fleet names. */
const fleets = ["ra", "rse", "snoo", "rising", "mirror"];

/** Mapping of rank names to numbers (fleet-agnostic). */
const rankTransform = new Map(
    [["Cadet", 1], ["Ensign", 2], ["Lieutenant", 3], ["Commander", 4],  ["Captain", 5], ["Admiral", 6], ["Fleet Admiral", 7],
     ["Citizen", 1], ["Uhlan", 2], ["Subcommander", 4], ["Senator", 6], ["Praetor", 7],
     ["Bekk", 1], ["Warrior", 2], ["Sergeant", 3], ["Snoo", 4], ["Snoogin", 5], ["Major Snoo", 6], ["Supreme Snoo", 7]]
);

/** Mapping of fleets to mappings of rank numbers to names. */
export const rankNames = new Map(
    [
        ["ra", new Map([[1, "Cadet"], [2, "Ensign"], [3, "Lieutenant"], [4, "Commander"], [5, "Captain"], [6, "Admiral"], [7, "Fleet Admiral"]])],
        ["rse", new Map([[1, "Citizen"], [2, "Uhlan}"], [3, "Lieutenant"], [4, "Subcommander"], [6, "Senator"], [7, "Praetor"]])],
        ["snoo", new Map([[1, "Bekk"], [2, "Warrior"], [3, "Sergeant"], [4, "Snoo"], [5, "Snoogin"], [6, "Major Snoo"], [7, "Supreme Snoo"]])],
        ["rising", new Map([[1, "Bekk"], [2, "Warrior"], [3, "Sergeant"], [4, "Snoo"], [5, "Snoogin"], [6, "Major Snoo"], [7, "Supreme Snoo"]])],
        ["mirror", new Map([[1, "Cadet"], [2, "Ensign"], [3, "Lieutenant"], [4, "Commander"], [5, "Captain"], [6, "Admiral"], [7, "Fleet Admiral"]])]
    ]
);

/** Mapping of short fleet names to long fleet names. */
export const fleetNames = new Map(
    [["ra", "REDdit Alert"], ["rse", "Reddit Star Empire"], ["snoo", "House of Snoo"], ["rising", "House of the Rising Snoo"], ["mirror", "Mirror Reddit"]]
);

/** List of days required in fleet for promotion to the next rank, by 0-start rank index. */
const rankDays = [14, 90];

/** List of contribs required for promotion to the next rank, by 0-start rank index. */
const rankContribs = [20000, 45000];

/** List of inactivity thresholds for kicking, by 0-start rank index. */
const rankKicksDays = [10, 14, 21, 28];

/**
 * Creates a toon from a legacy data export row.
 *
 * @param {Object} data The legacy data output to create the toon from.
 * @param {string} fleet The fleet for which the toon row was uplaoded.
 * @returns The newly created toon.
 */
const createToonLegacy = (data, fleet) => {
    let contribs = {};
    let charFleet = "";
    if ("fleet" in data) {
        charFleet = data.fleet;
    }
    else {
        charFleet = fleet;
    }
    contribs[charFleet] = data.contribs;

    let lastActive = "kdate" in data ? data["kdate"] : data["lastonline"];
    lastActive = moment(lastActive, "YYYY-MM-DD hh:mm:ss");
    return {
        character: data["cname"],
        account: data["account"],
        contribs: contribs,
        fleet: charFleet,
        currentRank: rankTransform.get(data["rank"]),
        maximumRank: rankTransform.get(data["rank"]),
        joinDate: moment(data["jdate"], "YYYY-MM-DD hh:mm:ss"),
        originalJoinDate: moment(data["jdate"], "YYYY-MM-DD hh:mm:ss"),
        lastActive: lastActive.isValid() ? lastActive : moment(data["jdate"], "YYYY-MM-DD hh:mm:ss"),
        level: "level" in data ? data["level"] : 0,
        publicNote: data["mcomment"],
        officerNote: data["ocomment"],
        officerNoteAuthor: data["ocommentauth"],
        inFleet: 1
    };
}


 /**
 * Creates a toon from a game roster export row.
 *
 * @param {Object} data The legacy data output to create the toon from.
 * @param {string} fleet The fleet for which the toon row was uplaoded.
 * @returns The newly created toon.
 */
export const createToon = (data, fleet) => {
    if ("cname" in data) {
        return createToonLegacy(data, fleet);
    }

    let contribs = { };
    contribs[fleet] = data["Contribution Total"];

    return {
        character: data["Character Name"],
        account: data["Account Handle"],
        contribs: contribs,
        fleet:  fleet,
        currentRank: rankTransform.get(data["Guild Rank"]),
        maximumRank: rankTransform.get(data["Guild Rank"]),
        joinDate: moment(data["Join Date"], "MM/DD/YYYY hh:mm:ssa"),
        originalJoinDate: moment(data["Join Date"], "MM/DD/YYYY hh:mm:ssa"),
        lastActive: moment(data["Last Active Date"], "MM/DD/YYYY hh:mm:ssa"),
        level: data["Level"],
        publicNote: data["Public Comment"],
        officerNote: data["Officer Comment"],
        officerNoteAuthor: data["Officer Comment Author"],
        inFleet: 1
    };
};


/**
 * Merge two different representations of the same toon.
 *
 * @param {Object} l Left, or older, toon to merge
 * @param {Object} r Right, or newer, toon to merge.
 * @returns The result of merging l with r.
 */
export const mergeToons = (l, r) => {
    if (l.account === "@LetheOblivion") {
        console.log("L:")
        console.log(l);
        console.log("R:");
        console.log(r);
    }
    let contribs = l.contribs;
    contribs[r.fleet] = r.contribs[r.fleet]

    let newToon = {
        character: l.character,
        account: l.account,
        contribs: contribs,
        fleet: r.fleet,
        currentRank: r.currentRank,
        maximumRank: Math.max(l.maximumRank, r.maximumRank),
        joinDate: r.joinDate,
        originalJoinDate: l.joinDate,
        lastActive: r.lastActive,
        level: r.level,
        officerNote: r.officerNote,
        officerNoteAuthor: r.officerNoteAuthor,
        publicNote: r.publicNote,
        inFleet: 1
    };

    if ("version" in l) {
        newToon.version = l.version;
    }

    return newToon;
};

/**
 * Scrub a toon of storage metadata.
 * 
 * @param {Object} toon Toon to scrub.
 * @returns The scrubbed toon.
 */
export const scrubToon = toon => {
    delete toon.createdAt;
    delete toon.updatedAt;
    
    toon.expectedVersion = toon.version;
    
    delete toon.version;

    return toon;
}

/**
 * Get total lifetime contribs for an entire account.
 * 
 * @param {string} account Account to get contribs for.
 * @returns The contribs object for the account.
 */
export const getTotalContribsByAccount = async account => {
    const response = await getAllToons({ account });

    if (response.errors && response.errors.length) {
        console.log("Encountered errors getting all toons for an account");
        console.log(response.errors);
    }

    const accountContribs = response.toons.map(toon => toon.contribs).reduce((l, r) => fleets.reduce((acc, cur) => ({...acc, [cur]: (l[cur] || 0) + (r[cur] || 0) }), {}), {});
    
    return fleets.reduce((acc, cur) => acc + accountContribs[cur], 0);
}

/**
 * Calculate summed contribs for a single toon.
 * @param {Object} toon Toon to get contribs for.
 * @returns The contribs of the given toon.
 */
export const getTotalContribs = toon => {
    return Object.values(toon.contribs).reduce((l, r) => l + r);
}

/**
 * Calculates which of an account's toons are up for promotion, if any.
 * 
 * @param {Array} allToons The list of all toons for a single account.
 * @returns The list of toons that need promotion.
 */
export const needsPromotion = allToons => {
    if (!Array.isArray(allToons) || !allToons.length) {
        return [];
    }

    // toon contribs, reduced via an inner reduce over fleets, to sum the contrib objects
    const accountContribs = allToons.map(toon => toon.contribs).reduce((l, r) => fleets.reduce((acc, cur) => ({...acc, [cur]: (l[cur] || 0) + (r[cur] || 0) }), {}), {});

    const totalContribs = fleets.reduce((acc, cur) => acc + accountContribs[cur], 0);
    
    const totalDays = moment.duration(Math.max(...allToons.filter(toon => toon.inFleet).map(toon => moment().diff(moment(toon.joinDate))))).asDays();
    
    const maxRank = Math.max(...(allToons.map(toon => toon.maximumRank)));
    
    return allToons.filter(toon => (totalDays > rankDays[toon.currentRank - 1] && totalContribs > rankContribs[toon.currentRank - 1]) || (toon.currentRank < maxRank))
};

/**
 * Checks if a given toon is up for kicking.
 * 
 * @param {Object} toon The toon to check.
 * @returns A value representing if the toon is up for kicking.
 */
export const needsKick = toon => {
    const goneDays = moment.duration(moment().diff(toon.lastActive)).asDays();
    return goneDays > rankKicksDays[toon.currentRank - 1];
}

/**
 * Groups items in a list by the result of some function.
 * 
 * @param {Array} list List of items to group.
 * @param {function(any): any} keyGetter 
 * @returns The map of grouped items.
 */
export const groupBy = (list, keyGetter) => {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

/**
 * Gets all (or some) toons from storage.
 * 
 * @param {Object} variables Variables to pass to the query.
 * @returns An object containing the returned toons and any errors.
 */
export const getAllToons = async (variables) => {
    
    let toons = [];
    let errors = [];
    let response = await API.graphql(graphqlOperation(queries.listToons, variables));

    if (response.data.listToons.nextToken) {
        variables.nextToken = response.data.listToons.nextToken;
        while (variables.nextToken) {
            if (response.data.listToons.items)
            {
                toons = [...toons, ...response.data.listToons.items];
            }
            if (response.data.listToons.errors) {
                errors = [...errors, ...response.data.listToons.errors];
            }
            variables.nextToken = response.data.listToons.nextToken;
            response = await API.graphql(graphqlOperation(queries.listToons, variables));
        }

        return {toons: toons, errors: errors};
    }

    return {toons: response.data.listToons.items, errors: response.data.listToons.errors};
}

/**
 * Gets all toons for a given fleet.
 * 
 * @param {string} fleet The fleet to get toons for.
 * @param {Boolean} inFleet A value representing if only toons currently marked as in fleet
 * should be retrieved.
 * @returns An object containing the returned toons and any errors.
 */
export const getAllToonsForFleet = async (fleet,  inFleet = false) => {
    let toons = [];
    let errors = [];
    const variables = { fleet }
    const operation = inFleet ? queries.toonsInFleet : queries.toonsByFleet;
    const operationString = inFleet ? "toonsInFleet" : "toonsByFleet";

    if (inFleet) {
        variables.inFleet = { eq: 1 };
    }

    let response = await API.graphql(graphqlOperation(operation, variables));

    if (response.data[operationString].nextToken) {
        variables.nextToken = response.data[operationString].nextToken;
        while (variables.nextToken) {
            if (response.data[operationString].items)
            {
                toons = [...toons, ...response.data[operationString].items];
            }
            if (response.data[operationString].errors) {
                errors = [...errors, ...response.data[operationString].errors];
            }
            variables.nextToken = response.data[operationString].nextToken;
            response = await API.graphql(graphqlOperation(operation, variables));
        }
        
        return {toons: toons, errors: errors};
    }
    
    return {toons: response.data[operationString].items, errors: response.data[operationString].errors};
}