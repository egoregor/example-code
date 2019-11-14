import React, { Component } from 'react';
import PropTypes from "prop-types";
import Baron from 'react-baron/dist/es5';

import {sumBgColor, currencyFormat, sumTotalBgColor} from '../utils/currencyUtil';

export default class DealsAnalysisDays extends Component {
    render() {
        const { analysis } = this.props;
        return (
            <Baron>   
                <table className="tableLayoutFixes analysisDaysTable-data">
                    <tbody>
                        {
                            analysis.data.map((analys, index) => (
                                <tr key={index}>
                                    <td style={{width: '62px'}} className="analysisDaysTable-dataDate">{analys.year}</td>
                                    <td className="text-right analysisDaysTable-dataDate" style={{width: '40px', paddingRight: '15px'}}>{analys.week}</td>
                                    {
                                        analys.values.map((value, index) => (
                                            <td 
                                                key={index} 
                                                className={`text-right ${value ? sumBgColor(value) : ''}`}
                                                style={{paddingRight: '6px'}}
                                            >
                                                {value ? currencyFormat(value) : ''}
                                            </td>
                                        ))
                                    }
                                    <td 
                                        className={`text-right ${sumTotalBgColor(analys.sum)}`} 
                                        style={{fontWeight: 'bold', paddingRight: '6px'}}
                                    >{currencyFormat(analys.sum)}</td>
                                </tr>
                            ))
                        }
                        <tr className="font-weight-bold">
                            <td style={{width: '62px', fontWeight: 'bold'}} className="analysisDaysTable-dataDate">Итого</td>
                            <td className="text-right analysisDaysTable-dataDate" style={{width: '40px', paddingRight: '15px'}}></td>
                            {
                                analysis.days_total_abs.map((value, index) => (
                                    <td 
                                        key={index} 
                                        className={`text-right ${value ? sumTotalBgColor(value) : ''}`} 
                                        style={{fontWeight: 'bold', paddingRight: '6px'}}
                                    >
                                        {value ? currencyFormat(value) : ''}
                                    </td>
                                ))
                            }
                            <td 
                                className={`text-right ${analysis.sum_days_total_abs ? sumTotalBgColor(analysis.sum_days_total_abs) : ''}`}
                                style={{fontWeight: 'bold', paddingRight: '6px'}}
                            >{currencyFormat(analysis.sum_days_total_abs)}</td>
                        </tr>
                        <tr className="font-weight-bold">
                            <td style={{width: '62px', fontWeight: 'bold'}} className="analysisDaysTable-dataDate">Итого, %</td>
                            <td className="text-right analysisDaysTable-dataDate" style={{width: '40px', paddingRight: '15px'}}></td>
                            {
                                analysis.days_total_percent.map((value, index) => (
                                    <td 
                                        key={index} 
                                        className={`text-right ${value ? sumTotalBgColor(value) : ''}`} 
                                        style={{fontWeight: 'bold', paddingRight: '6px'}}
                                    >
                                        {value ? `${currencyFormat(value)}` : ''}
                                    </td>
                                ))
                            }
                            <td 
                                className={`text-right ${analysis.sum_days_total_percent ? sumTotalBgColor(analysis.sum_days_total_percent) : ''}`}
                                style={{fontWeight: 'bold', paddingRight: '6px'}}
                            >{currencyFormat(analysis.sum_days_total_percent)}</td>
                        </tr>
                    </tbody>
                </table>
            </Baron>
        )
    }
}

DealsAnalysisDays.propTypes = {
    analysis: PropTypes.object
}