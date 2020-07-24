import React, { Component } from 'react';
import RosterRow from './RosterRow';
import Spinner from 'react-bootstrap/Spinner';

class Roster extends Component {
    render() {
        const promoRoster = this.props.title === "Promotions";
        return (
            <div className="roster">
                <h1>{this.props.title}</h1>
                {this.props.loading 
                ? <Spinner animation="grow" /> :
                <table className="table">
                    <thead>
                        <tr>
                            <th>Character</th>
                            <th>Account</th>
                            <th>Fleet</th>
                            <th>Lifetime Character Contributions in Fleet</th>
                            <th>Lifetime Account Contributions</th>
                            <th>Join Date</th>
                            <th>Last Active</th>
                            <th>Level</th>
                            <th>Rank</th>
                            { promoRoster && <th>Promote To</th> }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.toons.sort((l, r) => l.fleet.localeCompare(r.fleet) || l.account.localeCompare).map(toon => <RosterRow key={toon.character + toon.account} meta={toon} renderPromo={promoRoster} />)
                        }
                    </tbody>
                </table>
                }
            </div>
        );
    }
}
export default Roster;