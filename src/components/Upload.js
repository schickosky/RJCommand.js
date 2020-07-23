import React, { Component } from 'react';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { API, graphqlOperation } from 'aws-amplify';
import Papa from 'papaparse'
import { createToon, mergeToons, fleetNames, getAllToons, getAllToonsForFleet } from '../Utils';

class Upload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toons: [],
        };
        this.handleRosterFile = this.handleRosterFile.bind(this);
        this.handleParsedRoster = this.handleParsedRoster.bind(this);
        this.mergeWithStored = this.mergeWithStored.bind(this);
    }
    async componentDidMount() {
    }

    render() {
        return (
            <div className="upload input-group mb-3 mr-5">
                <div className="custom-file">
                    <input type="file" name={`${this.props.fleet}RosterUpload`} id={`${this.props.fleet}RosterUpload`} onChange={this.handleRosterFile} />
                    <label className="custom-file-label" for={`${this.props.fleet}RosterUpload`}>Upload Roster for {fleetNames.get(this.props.fleet)}</label>
                </div>
            </div>
        );
    }

    async handleRosterFile(event) {
        const file = event.target.files[0];

        try {
            const response = await getAllToonsForFleet(this.props.fleet);
            if (response.errors.length)
            {
                console.log("Encountered errors getting existing toons");
                console.log(response.errors);
            }

            this.setState({
                toons: response.toons
            });
        } catch (error) {
            console.log(error);
        }

        const parseFile = rawFile => {
            return new Promise(resolve => {
                Papa.parse(rawFile, {
                    complete: result => resolve(result.data),
                    header: true,
                    skipEmptyLines: true
                });
            });
        };

        const parsedFile = await parseFile(file);

        await this.handleParsedRoster(parsedFile);
    }

    async handleParsedRoster(result) {
        const toons = await Promise.all(result.map(async row => await this.mergeWithStored(createToon(row, this.props.fleet))));
        const toonsMissing = this.state.toons.filter(stateToon => toons.some(storedToon => storedToon.account === stateToon.account && storedToon.character === stateToon.character) === false);
        
        toonsMissing.forEach(toon => toon.inFleet = false);
        await Promise.all(toonsMissing.map(async toon => await API.graphql(graphqlOperation(mutations.updateToon, {input: toon, expectedVersion: toon.version}))));

        await Promise.all(toons.map(async toon => {
            if ("version" in toon) {
                try {
                await API.graphql(graphqlOperation(mutations.updateToon, { input: toon, expectedVersion: toon.version }));        
                } catch (error) {
                    console.log(error);
                }
            }
            else {
                try {
                    await API.graphql(graphqlOperation(mutations.createToon, { input: toon }));
                }
                catch (error) {
                    console.log(error);
                }
            }
        }));
    }

    async mergeWithStored(toon) {
        try {
            const stored = await API.graphql(graphqlOperation(queries.getToon, { character: toon.character, account: toon.account }));

            if (stored.data.getToon)
            {
                return mergeToons(toon, createToon(stored.data.getToon));
            }
        }
        catch (error) {
            console.log(error);
        }
        return toon;
    }
}

export default Upload;