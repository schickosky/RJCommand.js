import React, { Component } from 'react';
import Roster from './Roster';
import { getAllToons } from '../Utils';

class Lookup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            charValue: '',
            accountValue: '',
            toons: []
        };

        this.onKeyDown = this.onKeyDown.bind(this);
        this.characterChange = this.characterChange.bind(this);
        this.accountChange = this.accountChange.bind(this);
    }
    render() {
        return (
            <div className="lookup">
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="Character" value={this.state.charValue} onKeyDown={this.onKeyDown} onChange={this.characterChange} />
                    <div className="input-group-prepend input-group-append">
                        <span className="input-group-text">@</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Account" value={this.state.accountValue} onKeyDown={this.onKeyDown} onChange={this.accountChange} />
                </div>
                { this.state.toons && <Roster toons={this.state.toons} title="Results" />}
            </div>
        );
    }

    characterChange(e) {
        this.setState({charValue: e.target.value});
    }

    accountChange(e) {
        this.setState({accountValue: e.target.value});
    }

    async onKeyDown(e) {
        if (e.key === 'Enter') {
            const filter = {};
            if (this.state.charValue) {
                filter.character = {contains: this.state.charValue};
            }
            if (this.state.accountValue) {
                filter.account = {contains: this.state.accountValue};
            }

            const query = await getAllToons({filter: filter});

            if (query.errors)
            {
                console.log("Encountered errors getting filtered toons");
                console.log(query.errors)
            }

            this.setState({toons: query.toons});
        }
    }
}

export default Lookup;