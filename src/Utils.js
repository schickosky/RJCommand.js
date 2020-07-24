import moment from 'moment';
import { API, graphqlOperation } from 'aws-amplify';
import * as queries from './graphql/queries';


const fleets = ["ra", "rse", "snoo", "rising", "mirror"];
const rankTransform = new Map(
    [["Cadet", 1], ["Ensign", 2], ["Lieutenant", 3], ["Commander", 4], ["Admiral", 6], ["Fleet Admiral", 7],
     ["Citizen", 1], ["Uhlan", 2], ["Subcommander", 4], ["Senator", 6], ["Praetor", 7],
     ["Bekk", 1], ["Warrior", 2], ["Sergeant", 3], ["Snoo", 4], ["Major Snoo", 6], ["Supreme Snoo", 7]]
);
export const rankNames = new Map(
    [
        ["ra", new Map([[1, "Cadet"], [2, "Ensign"], [3, "Lieutenant"], [4, "Commander"], [6, "Admiral"], [7, "Fleet Admiral"]])],
        ["rse", new Map([[1, "Citizen"], [2, "Uhlan}"], [3, "Lieutenant"], [4, "Subcommander"], [6, "Senator"], [7, "Praetor"]])],
        ["snoo", new Map([[1, "Bekk"], [2, "Warrior"], [3, "Sergeant"], [4, "Snoo"], [6, "Major Snoo"], [7, "Supreme Snoo"]])],
        ["rising", new Map([[1, "Bekk"], [2, "Warrior"], [3, "Sergeant"], [4, "Snoo"], [6, "Major Snoo"], [7, "Supreme Snoo"]])],
        ["mirror", new Map([[1, "Cadet"], [2, "Ensign"], [3, "Lieutenant"], [4, "Commander"], [6, "Admiral"], [7, "Fleet Admiral"]])]
    ]
);
console.log(rankNames);
export const fleetNames = new Map(
    [["ra", "REDdit Alert"], ["rse", "Reddit Star Empire"], ["snoo", "House of Snoo"], ["rising", "House of the Rising Snoo"], ["mirror", "Mirror Reddit"]]
);

const rankDays = [14, 90];
const rankContribs = [20000, 45000];
const rankKicksDays = [10, 14, 21, 28];

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
        inFleet: true
    };
}

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
        officerNoteAuth: data["Officer Comment Author"],
        inFleet: true
    };
};

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
        inFleet: true
    };

    if ("version" in l) {
        newToon.version = l.version;
    }

    return newToon;
};

export const scrubToon = toon => {
    delete toon.createdAt;
    delete toon.updatedAt;
    toon.expectedVersion = toon.version;
    delete toon.version;

    return toon;
}

export const getTotalContribsByAccount = async account => {
    const response = await getAllToons({ account: account });
    if (response.errors.length) {
        console.log("Encountered errors getting all toons for an account");
        console.log(response.errors);
    }

    const accountContribs = response.toons.map(toon => toon.contribs).reduce((l, r) => fleets.reduce((acc, cur) => ({...acc, [cur]: (l[cur] || 0) + (r[cur] || 0) }), {}), {});
    return fleets.reduce((acc, cur) => acc + accountContribs[cur], 0);
}

export const getTotalContribs = toon => {
    return Object.values(toon.contribs).reduce((l, r) => l + r);
}

export const needsPromotion = allToons => {
    if (!Array.isArray(allToons) || !allToons.length) {
        return [];
    }

    const accountContribs = allToons.map(toon => toon.contribs).reduce((l, r) => fleets.reduce((acc, cur) => ({...acc, [cur]: (l[cur] || 0) + (r[cur] || 0) }), {}), {});
    const totalContribs = fleets.reduce((acc, cur) => acc + accountContribs[cur], 0);
    const totalDays = moment.duration(Math.max(...allToons.filter(toon => toon.inFleet).map(toon => moment().diff(moment(toon.joinDate))))).asDays();
    const maxRank = Math.max(...(allToons.map(toon => toon.maximumRank)));
    return allToons.filter(toon => (totalDays > rankDays[toon.currentRank - 1] && totalContribs > rankContribs[toon.currentRank - 1]) || (toon.currentRank < maxRank))
};

export const needsKick = toon => {
    const goneDays = moment.duration(moment().diff(toon.lastActive)).asDays();
    return goneDays > rankKicksDays[toon.currentRank - 1];
}

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

export const getAllToons = async (variables) => {
    let toons = [];
    let errors = [];
    let response = await API.graphql(graphqlOperation(queries.listToons, variables));
    while (response.data.listToons.nextToken) {
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

export const getAllToonsForFleet = async (fleet,  inFleet = false) => {
    let toons = [];
    let errors = [];
    const variables = { fleet: {eq: fleet} }
    const operation = inFleet ? queries.toonsInFleet : queries.toonsByFleet;

    if (inFleet) {
        variables.inFleet = true;
    }

    let response = await API.graphql(graphqlOperation(operation, variables));
    while (response.data.toonsByFleet.nextToken) {
        if (response.data.toonsByFleet.items)
        {
            toons = [...toons, ...response.data.toonsByFleet.items];
        }
        if (response.data.toonsByFleet.errors) {
            errors = [...errors, ...response.data.toonsByFleet.errors];
        }
        variables.nextToken = response.data.toonsByFleet.nextToken;
        response = await API.graphql(graphqlOperation(operation, variables));
    }

    return {toons: toons, errors: errors};
}