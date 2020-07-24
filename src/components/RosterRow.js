import React, { Component } from 'react';
import { rankNames, fleetNames, getTotalContribsByAccount } from '../Utils';
import moment from 'moment';

class RosterRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accountContribs: 0
        };
    }
    async componentDidMount() {
        const totalContribs = await getTotalContribsByAccount(this.props.meta.account);
        this.setState({ accountContribs: totalContribs });
    }
    render() {
        return (
            <tr>
                <td>
                    {this.props.meta.character}
                </td>
                <td>
                    {this.props.meta.account}
                </td>
                <td>
                    {fleetNames.get(this.props.meta.fleet)}
                </td>
                <td>
                    {this.props.meta.contribs[this.props.meta.fleet] ? this.props.meta.contribs[this.props.meta.fleet].toLocaleString() : 0}
                </td>
                <td>
                    {this.state.accountContribs.toLocaleString()}
                </td>
                <td>
                    {moment(this.props.meta.joinDate).format('llll')}
                </td>
                <td>
                    {moment(this.props.meta.lastActive).format('llll')}
                </td>
                <td>
                   {this.props.meta.level} 
                </td>
                <td>
                    {rankNames.get(this.props.meta.fleet).get(this.props.meta.currentRank)}
                </td>
                { this.props.renderPromo &&
                    <td>
                        {rankNames.get(this.props.meta.fleet).get(this.props.meta.currentRank + 1)}
                    </td>
                }
            </tr>
        );
    }
}

export default RosterRow