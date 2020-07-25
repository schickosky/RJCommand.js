import React, { Component } from 'react';
import { needsPromotion, fleets, groupBy, needsKick, getAllToons, getAllToonsForFleet } from '../Utils';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { API, graphqlOperation } from 'aws-amplify';
import Roster from './Roster';
import Lookup from './Lookup';
import { FaSync } from 'react-icons/fa'
class Views extends Component {
    constructor(props) {
        super(props);
        this.state = {
            promoToons: [],
            kickToons: [],
            illegalRaAlts: [],
            loading: true
        };
    }
    async componentDidMount() {
        await this.load();
    }

    render() {
        return (
            <div className="view">
                <button className="btn btn-lg btn-primary mb-5" onClick={async e => await this.load()}><FaSync />  Refresh</button>
                <div className="mx-5">
                    <Lookup />
                </div>
                <Roster toons={this.state.promoToons} title="Promotions" loading={this.state.loading} reload={this.load} />
                <Roster toons={this.state.kickToons} title="Kicks" loading={this.state.loading} reload={this.load} />
                <Roster toons={this.state.illegalRaAlts} title="Illegal Alts in RA" loading={this.state.loading} reload={this.load} />
            </div>
        );
    }

    load = async () => {
        try {
            this.setState({ loading: true });
            const response = await getAllToons({});
            const toons = response.toons;

            const accountToons = groupBy(toons, toon => toon.account);

            const toonsNeedPromotion = Array.from(accountToons.values()).map(needsPromotion).flat().filter(toon => toon.inFleet);

            const raResponse = await getAllToonsForFleet("ra", true);
            
            const raToonsByAccount = groupBy(raResponse.toons.filter(toon => toon.inFleet), toon => toon.account);
            
            const raToons = [...raToonsByAccount].map(([account, accountToons]) => accountToons).filter(accountToons => accountToons.length > 1).flat();
            
            const toonsNeedKick = toons.filter(toon => toon.inFleet && needsKick(toon) && toonsNeedPromotion.some(promoToon => promoToon.account === toon.account && promoToon.character === toon.character ));

            this.setState({
                promoToons: toonsNeedPromotion.filter(Boolean),
                kickToons: toonsNeedKick.filter(Boolean),
                illegalRaAlts: raToons.filter(Boolean),
                loading: false
            });
        } catch (error) {
            console.log(error);
            this.setState({ loading: false });
        }
    }
}

export default Views;