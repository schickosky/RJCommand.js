import React, { Component } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { API, graphqlOperation } from 'aws-amplify';
import Papa from 'papaparse'
import { createToon, mergeToons, fleetNames, scrubToon, getAllToonsForFleet } from '../Utils';

class Upload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toons: [],
            loading: false, 
            error: ""
        };
        this.handleRosterFile = this.handleRosterFile.bind(this);
        this.handleParsedRoster = this.handleParsedRoster.bind(this);
        this.mergeWithStored = this.mergeWithStored.bind(this);
    }
    async componentDidMount() {
    }

    render() {
        return (
            <div className="upload">
                {
                this.state.loading ? <Spinner animation="grow" />
                :
                <div className="input-group mb-3 mr-5">
                <div className="custom-file">
                    <input type="file" name={`${this.props.fleet}RosterUpload`} id={`${this.props.fleet}RosterUpload`} onChange={this.handleRosterFile} />
                    <label className="custom-file-label" for={`${this.props.fleet}RosterUpload`}>Upload Roster for {fleetNames.get(this.props.fleet)}</label>
                </div>
                </div>
                }
                { this.state.error && <div className="alert alert-danger" onCLick={e => this.setState({ error: "" })}>{this.state.error}</div> }
            </div>
        );
    }

    async handleRosterFile(event) {
        const file = event.target.files[0];
        this.setState({ loading: true });
        try {
            const response = await getAllToonsForFleet(this.props.fleet, true);
            if (response.errors && response.errors.length)
            {
                console.log("Encountered errors getting existing toons");
                console.log(response.errors);
                this.setState( { error: this.state.error + response.errors.join("; ") + "; "})
            }

            this.setState({
                toons: response.toons
            });
        } catch (error) {
            console.log(error);
            this.setState({ error: this.state.error + error + "; " });
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

        this.setState({ loading: false });
    }

    async handleParsedRoster(result) {
        const toons = await Promise.all(result.map(async row => await this.mergeWithStored(createToon(row, this.props.fleet))));
        
        const toonsMissing = this.state.toons.filter(stateToon => toons.some(storedToon => storedToon.account === stateToon.account && storedToon.character === stateToon.character) === false);
        
        toonsMissing.forEach(toon => toon.inFleet = 0);

        console.log("updating missing toons");

        await Promise.all(toonsMissing.map(async toon => await API.graphql(graphqlOperation(mutations.updateToon, {input: scrubToon(toon)}))));

        console.log("updating in-fleet toons");

        await Promise.all(toons.map(async toon => {
            if ("version" in toon) {
                try {
                    await API.graphql(graphqlOperation(mutations.updateToon, { input: scrubToon(toon) }));        
                } catch (error) {
                    console.log(error);
                    this.setState({ error: this.state.error + error + "; "})
                }
            }
            else {
                try {
                    await API.graphql(graphqlOperation(mutations.createToon, { input: toon }));
                }
                catch (error) {
                    console.log(error);
                    this.setState({ error: this.state.error + error + "; "})
                }
            }
        }));
    }

    async mergeWithStored(toon) {
        try {
            const stored = await API.graphql(graphqlOperation(queries.getToon, { character: toon.character, account: toon.account }));

            if (stored.data.getToon)
            {
                return mergeToons(stored.data.getToon, toon);
            }
        }
        catch (error) {
            console.log(error);
            this.setState({ error: this.state.error + error + "; "})
        }
        return toon;
    }
}

export default Upload;