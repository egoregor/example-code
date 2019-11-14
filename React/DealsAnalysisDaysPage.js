import React from 'react';
import { connect } from 'react-redux';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import {catchPromise} from '../utils/http';
import {getDealsAnalysisDays, getBoards} from '../utils/analysisHttp';
import {setDealsAnalysisDays} from '../actions/analysis';
import DealsAnalysisDays from '../components/DealsAnalysisDays';

am4core.useTheme(am4themes_animated);

export class DealsAnalysisDaysPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            boardsList: [],
            boardId: 0,
            weeksNum: 4,
            accountFilter: props.tradingAccount.id || '',
            weeksError: '',
            isLoading: false,
            pageError: false
        };
    }
    errorCb = () => {
        this.setState({pageError: true});
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.tradingAccount.id !== nextProps.tradingAccount.id) {
            this.setState(
                {accountFilter: nextProps.tradingAccount.id || ''}, 
                () => {
                    this.loadAnalysis({
                        accountId: this.state.accountFilter, 
                        boardId: this.state.boardId, 
                        weeksNum: this.state.weeksNum
                    });
                }
            );
        }
    }
    componentDidMount() {
        let chart = am4core.create("chartdiv", am4charts.XYChart);
        chart.paddingRight = 0;
    
        chart.data = [];    
        

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = -90;
        valueAxis.max = 90;
        valueAxis.fontSize = '8px';
        valueAxis.renderer.labels.template.fill = am4core.color("#8f98b9");
        valueAxis.renderer.grid.template.disabled = true;
        valueAxis.renderer.labels.template.disabled = true;
        valueAxis.numberFormatter.numberFormat = "#";
        // valueAxis.cursorTooltipEnabled = false;
        let axisTooltip = valueAxis.tooltip;
        axisTooltip.background.fill = am4core.color("#1e62d6");
        axisTooltip.background.strokeWidth = 0;
        axisTooltip.background.cornerRadius = 9;
        axisTooltip.background.pointerLength = 0;
        axisTooltip.dx = -5;
        axisTooltip.fontSize = '10px';
        valueAxis.title.text = "";

        // Create axes
        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "day";
        categoryAxis.title.text = "";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        // categoryAxis.renderer.grid.template.strokeWidth = 0;
        categoryAxis.renderer.grid.template.disabled = true;
        // categoryAxis.renderer.labels.template.disabled = true;
        categoryAxis.fontSize = '8px';
        categoryAxis.renderer.labels.template.fill = am4core.color("#8f98b9");
        categoryAxis.cursorTooltipEnabled = false;
        let categoryTooltip = categoryAxis.tooltip;
        categoryTooltip.background.fill = am4core.color("#1e62d6");
        categoryTooltip.background.strokeWidth = 0;
        categoryTooltip.background.cornerRadius = 9;
        categoryTooltip.background.pointerLength = 0;
        categoryTooltip.minWidth = 80;
        categoryTooltip.dy = 5;
        categoryTooltip.fontSize = '8px';
        /* Decorate axis tooltip content */
        // categoryTooltip.adapter.add("getTooltipText", (text) => {
        //     return text;
        // });
        // chart.xAxes[0].tooltip.background.fill = am4core.color("#ffffff");

        // Create series
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = "percent";
        series.dataFields.categoryX = "day";
        series.columns.template.width = 80;
        series.name = "Процент";
        series.tooltip.disabled = true;
        series.tooltipText = "{valueY}[/]";
        series.stacked = true;
        
        
        let columnTemplate = series.columns.template;
        columnTemplate.tooltipText = "{categoryX}: {valueY}[/]";
        columnTemplate.fillOpacity = 1;
        columnTemplate.strokeOpacity = 0;
        columnTemplate.fill = am4core.color("#3fa764");
        let shadow = new am4core.DropShadowFilter();
        shadow.height = 100;
        shadow.dx = -2;
        shadow.dy = 0;
        shadow.opacity = 0.25;
        columnTemplate.filters.push(shadow);
        columnTemplate.adapter.add("fill", function(fill, target) {
            if (target.dataItem && (parseInt(target.dataItem.valueY) < 0)) {
                return am4core.color("#de645d");
            }
            else {
                return fill;
            }
        });
        function createGrid(value) {
            let range = valueAxis.axisRanges.create();
            range.value = value;
            if(value == 0) range.label.text = "% {value}"
                else range.label.text = "{value}";
            range.grid.strokeOpacity = 0;
        }
        createGrid(0);
        createGrid(20);
        createGrid(40);
        createGrid(60);
        createGrid(80);
        createGrid(100);
        createGrid(-20);
        createGrid(-40);
        createGrid(-60);
        createGrid(-80);
        createGrid(-100);
        let range = categoryAxis.axisRanges.create()
        range.value = '';
        range.label.text = '';
        
        chart.cursor = new am4charts.XYCursor();
        
        /* Configure cursor lines */
        chart.cursor.lineX.stroke = am4core.color("#e1e2e8");
        chart.cursor.lineX.strokeWidth = 1;
        chart.cursor.lineX.strokeOpacity = 0.9;
        chart.cursor.lineX.strokeDasharray = "";

        chart.cursor.lineY.stroke = am4core.color("#e1e2e8");
        chart.cursor.lineY.strokeWidth = 1;
        chart.cursor.lineY.strokeOpacity = 0.9;
        chart.cursor.lineY.strokeDasharray = "";
    
        this.chart = chart;

        this.loadBoards();
        if(this.state.accountFilter) {
            this.loadAnalysis({
                accountId: this.state.accountFilter, 
                boardId: this.state.boardId, 
                weeksNum: this.state.weeksNum
            });
        }
    }
    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    loadBoards = () => {
        getBoards()
        .then((res) => {
            this.setState({boardsList: res.data.boards});
        })
        .catch((err) => {
            catchPromise(err, this.loadBoards, this.errorCb);
        });
    }
    loadAnalysis = (data) => {
        this.setState({isLoading: true});
        if(data.weeksNum != '0' && data.weeksNum != '') {
            getDealsAnalysisDays(data)
            .then((res) => {
                this.setState({isLoading: false});
                this.props.setDealsAnalysisDays(res.data);
                this.updateChartData(res.data.days_total_percent, res.data.sum_days_total_percent);
            })
            .catch((err) => {
                if(err.response.data && err.response.status != 401) {
                    this.setState({weeksError: err.response.data.message, isLoading: false});
                }
                else catchPromise(err, this.loadAnalysis.bind(this. data), this.errorCb);
            });
        }
    }
    onBoardChange = (id) => {
        if(this.state.boardsList.find(board => board.id == id) || id == 0) {
            this.setState({boardId: id});
            this.loadAnalysis({
                accountId: this.state.accountFilter, 
                boardId: id, 
                weeksNum: this.state.weeksNum
            });
        }
    }
    updateChartData = (percents, total) => {
        const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ']
        let tempChartData = [];
        tempChartData.push({
            'day': '',
            'percent': 0
        });
        for (let i = 0; i < percents.length; i++) {
            tempChartData.push({
                'day': weekDays[i],
                'percent': parseFloat(percents[i])
            });
        }
        tempChartData.push({
            'day': 'ИТОГО',
            'percent': parseFloat(total)
        });
        this.chart.data = tempChartData;
    }
    keyPress = (e) => {
        if(e.keyCode == 13){
            this.loadAnalysis({
                accountId: this.state.accountFilter, 
                boardId: this.state.boardId, 
                weeksNum: this.state.weeksNum
            });
        }
     }
    onWeeksNumChange = (e) => {
        const weeksNum  = e.target.value;
        if (!weeksNum || weeksNum.match(/^[0-9]+$/)) {
            this.setState({weeksNum});
        }
    }

	render() {
		return (
            <div className="analysis-days card-content">
                {                    
                    !this.state.pageError ? (
                        <div>
                            <ul className="nav nav-tabs boardsTabs">
                                <li className="nav-item" onClick={() => {this.onBoardChange(0)}}>
                                    <span
                                        className='nav-link text-center active show'
                                        data-toggle='tab'
                                    >
                                        <span>Все</span>
                                    </span>
                                </li>
                                <li className="nav-item docTab-sign" onClick={() => {this.onBoardChange(2)}}>
                                    <span
                                        className={`nav-link text-center  ${!this.state.boardsList.find(board => board.id == 2) ? 'emptyTab' : ''}`}
                                        data-toggle={`${this.state.boardsList.find(board => board.id == 2) ? 'tab' : ''}`}
                                    >
                                        <span className="docTab-sign">
                                            <span>Валюта</span>
                                        </span>
                                    </span>
                                </li>
                                <li className="nav-item" onClick={() => {this.onBoardChange(1)}}>
                                    <span
                                        className={`nav-link text-center  ${!this.state.boardsList.find(board => board.id == 1) ? 'emptyTab' : ''}`}
                                        data-toggle={`${this.state.boardsList.find(board => board.id == 1) ? 'tab' : ''}`}
                                    >
                                        <span>Фьючерсы</span>
                                    </span>
                                </li>
                                <li className="nav-item" onClick={() => {this.onBoardChange(3)}}>
                                    <span
                                        className={`nav-link text-center ${!this.state.boardsList.find(board => board.id == 3) ? 'emptyTab' : ''}`}
                                        data-toggle={`${this.state.boardsList.find(board => board.id == 3) ? 'tab' : ''}`}
                                    >
                                        <span>Акции</span>
                                    </span>
                                </li>
                                <li className="closeDealsBtns">
                                    <div className="analysisDay-filterWeek">
                                        <label className={`floating-label ${this.state.weeksNum == '' ? 'hidden' : ''}`}>Количество недель</label>
                                        <input 
                                            type="text" 
                                            className={`inputUnderLine ${(!this.state.weeksNum || this.state.weeksNum == 0) ? 'inputValidateWrong' : ''}`}
                                            placeholder="Количество недель"
                                            value={this.state.weeksNum} 
                                            onChange={this.onWeeksNumChange} 
                                            onBlur={() => {
                                                this.loadAnalysis({
                                                    accountId: this.state.accountFilter, 
                                                    boardId: this.state.boardId, 
                                                    weeksNum: this.state.weeksNum
                                                })
                                            }}
                                            onKeyDown={this.keyPress}
                                        />
                                    </div>
                                </li>
                            </ul>
        
                            <div className="tab-content">
                                <div className="tab-pane fade active show">
                                    
                                    <div className="table">
                                        <table className="tableLayoutFixes analysisDaysTable-titles">
                                            <thead>
                                                <tr>
                                                    <td style={{width: '62px'}}>ГОД</td>
                                                    <td className="text-right" style={{width: '40px', paddingRight: '15px'}}>НЕД.</td>
                                                    <td className="text-center">ПН</td>
                                                    <td className="text-center">ВТ</td>
                                                    <td className="text-center">СР</td>
                                                    <td className="text-center">ЧТ</td>
                                                    <td className="text-center">ПТ</td>
                                                    <td className="text-center">ИТОГО</td>
                                                </tr>
                                            </thead>
                                        </table>
                                        {
                                            (
                                                parseFloat(this.props.dealsAnalysisDays.sum_days_total_abs) != 0 && 
                                                this.props.dealsAnalysisDays.data.length > 0 && 
                                                !this.state.isLoading
                                            ) ? (
                                                <DealsAnalysisDays analysis={this.props.dealsAnalysisDays} />
                                            ) : (
                                                <div className="emptyDashboard-plug">
                                                    {
                                                        this.state.isLoading ? (
                                                            <div className="mt-1 text-center spinner-container isLoadingSpinner"><span><img src="/images/ui/load-spinner.png" className="spinner" alt="" /></span></div>
                                                        ) : (
                                                            <div className='emptyData'>нет данных</div>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="card chartContainer" style={{display: this.props.dealsAnalysisDays.sum_days_total_abs && parseFloat(this.props.dealsAnalysisDays.sum_days_total_abs) != 0 ? 'block' : 'none'}}>
                                <div className="chart-logoRemover"></div>
                                <div id="chartdiv" style={{ width: "100%", height: "250px", display: parseFloat(this.props.dealsAnalysisDays.sum_days_total_abs) != 0 ? 'block' : 'none'}}></div>
                            </div>
                        </div>
                    ) : (
                        <h3 className="text-center text-danger">Произошла ошибка</h3>
                    )
                }
            </div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
        dealsAnalysisDays: state.dealsAnalysisDays,
        tradingAccounts: state.tradingAccounts,
        tradingAccount: state.tradingAccount
	};
};

const mapDispatchToProps = (dispatch) => ({
    setDealsAnalysisDays: (dealsAnalysisDays) => dispatch(setDealsAnalysisDays(dealsAnalysisDays))
});

export default connect(mapStateToProps, mapDispatchToProps)(DealsAnalysisDaysPage);