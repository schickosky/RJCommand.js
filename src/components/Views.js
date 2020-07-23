import React, { Component } from 'react';
import { needsPromotion, fleets, groupBy, needsKick, getAllToons, getAllToonsForFleet } from '../Utils';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { API, graphqlOperation } from 'aws-amplify';
import Roster from './Roster';
import Lookup from './Lookup';

class Views extends Component {
    constructor(props) {
        super(props);
        this.state = {
            promoToons: [],
            kickToons: [],
            illegalRaAlts: []
        };
    }
    async componentDidMount() {
        try {
            const response = await getAllToons({});
            const toons = response.toons;

            const accountToons = groupBy(toons, toon => toon.account);

            const toonsNeedPromotion = Array.from(accountToons.values()).map(needsPromotion).flat();

            const raResponse = await getAllToonsForFleet("ra");
            const raToonsByAccount = groupBy(raResponse.toons.filter(toon => toon.inFleet), toon => toon.account);
            
            const raToons = [...raToonsByAccount].map(([account, accountToons]) => accountToons).filter(accountToons => accountToons.length > 1).flat();
            
            const toonsNeedKick = toons.filter(toon => needsKick(toon) && toonsNeedPromotion.some(promoToon => promoToon.account === toon.account && promoToon.character === toon.character ));

            this.setState({
                promoToons: toonsNeedPromotion.filter(Boolean),
                kickToons: toonsNeedKick.filter(Boolean),
                illegalRaAlts: raToons.filter(Boolean)
            });
        } catch (error) {
            console.log(error);
        }
    }
    render() {
        return (
            <div className="view">
                <div className="mx-5">
                    <Lookup />
                </div>
                <Roster toons={this.state.promoToons} title="Promotions" />
                <Roster toons={this.state.kickToons} title="Kicks" />
                <Roster toons={this.state.illegalRaAlts} title="Illegal Alts in RA" />
            </div>
        );
    }
}

export default Views;