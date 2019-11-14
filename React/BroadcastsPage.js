import React from 'react';
import { connect } from 'react-redux';

import {catchPromise} from '../utils/http';
import {getBroadcasts} from '../utils/broadcastsHttp';
import {setBroadcasts} from '../actions/broadcasts';
import Broadcasts from '../components/Broadcasts';

export class BroadcastsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            broadcasts: [],
            page_num: 1,
            page_total: 1,
            filteredBroadcasts: [],
            tagFilters: [],
            loaded: true,
            pageError: false
        };
    }
    errorCb = () => {
        this.setState({pageError: true});
    }
    componentDidMount() {
        document.getElementsByClassName("content")[0].addEventListener("wheel", this.scrollContent);

        this.loadBroadcasts(1);
    }
    loadBroadcasts = (page_num) => {
        this.setState({loaded: true});
        getBroadcasts(page_num)
        .then((res) => {
            this.setState({
                broadcasts: [...this.state.broadcasts, ...res.data.streams],
                page_num,
                page_total: res.data.page_total,
                loaded: false
            }, () => {
                this.toFilterBroadcasts();
            });
        })
        .catch((err) => {
            this.setState({loaded: false});
            catchPromise(err, this.loadBroadcasts.bind(this, page_num), this.errorCb);
        });
    }

    // переход по ссылке при нажатии на кнопку
    linkToHref = (link) => {
        window.open(link, '_blank');
    }

    // Добавление тега в список фильтров
    addFilterBroadcasts = (tag) => {
        let existTag = false;
        for (let i = 0; i < this.state.tagFilters.length; i++) {
            if(this.state.tagFilters[i].id === tag.id) existTag = true;
        }
        if(!existTag) {
            let tagFilters = this.state.tagFilters;
            tagFilters.push(tag);
            this.setState({tagFilters}, () => {
                this.toFilterBroadcasts();
            });
        }
        
    }
    
    // Удаление тега из списка фильтров
    removeFilterBroadcasts = (index) => {
        let tagFilters = this.state.tagFilters;
        tagFilters.splice(index, 1);
        this.setState({tagFilters}, () => {
            this.toFilterBroadcasts();
        });
    }
    
    toFilterBroadcasts = () => {
        let filteredBroadcasts = [];
        for (let i = 0; i < this.state.broadcasts.length; i++) {
            let filterCount = 0;
            for (let j = 0; j < this.state.broadcasts[i].tags.length; j++) {
                for (let k = 0; k < this.state.tagFilters.length; k++) {
                    if(this.state.broadcasts[i].tags[j].id == this.state.tagFilters[k].id) filterCount++;  
                }              
            }
            if(filterCount == this.state.tagFilters.length) filteredBroadcasts.push(this.state.broadcasts[i]);
        }
        this.setState({filteredBroadcasts})
    }
    handlePageChange = () => {
        this.loadBroadcasts(this.state.page_num + 1);
    }

    scrollContent = (e) => {
        const pageScroller = $('.page-content > .clipper > .scroller');
        const pageContentWrap = $('.content-wrapper');
        
        if(pageScroller.scrollTop() + pageScroller.height() == pageContentWrap.height() && !this.state.loaded && this.state.page_num <  this.state.page_total)
            this.loadBroadcasts(this.state.page_num + 1);
    }

	render() {
		return (
            <div className="content-broadcast">
                <div className="broadcasts">
                    <h1 className="title">Трансляции</h1>
                    {
                        this.state.tagFilters.length > 0 &&
                            <div className="broadcastTagsFilter">
                            {
                                this.state.tagFilters.map((tag, index) => (
                                    <div 
                                        key={`index-${tag.id}`} 
                                        className={`broadcastTagFilter tag${tag.id}`}
                                        onClick={() => {this.removeFilterBroadcasts(index)}}
                                    >
                                        {tag.name} <i className="icon-cross3"></i>
                                    </div>
                                ))
                            }
                            </div>
                    }
                    {
                        !this.state.pageError ? (
                            <div>
                                <Broadcasts 
                                    broadcasts={this.state.filteredBroadcasts} 
                                    broadcastsFull={this.state.broadcasts}
                                    linkToHref={this.linkToHref}
                                    addFilterBroadcasts={this.addFilterBroadcasts}
                                    page_num={this.state.page_num}
                                    page_total={this.state.page_total}
                                    handlePageChange={this.handlePageChange}
                                    scrollParentRef={this.props.scrollParentRef}
                                />
                                {
                                    (this.state.loaded) &&
                                        <div className="mt-2 mb-2 text-center spinner-container"><span><img src="/images/ui/load-spinner.png" className="spinner" alt="" /></span></div>
                                }
                            </div>
                        ) : (
                            <h3 className="text-center text-danger">Произошла ошибка</h3>
                        )
                    }
                </div>
            </div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
        broadcasts: state.broadcasts,
	};
};

const mapDispatchToProps = (dispatch) => ({
    setBroadcasts: (broadcasts) => dispatch(setBroadcasts(broadcasts))
});

export default connect(mapStateToProps, mapDispatchToProps)(BroadcastsPage);