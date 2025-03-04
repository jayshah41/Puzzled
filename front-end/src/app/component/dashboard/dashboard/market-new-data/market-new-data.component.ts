import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem, CdkDragExit, CdkDragEnter } from '@angular/cdk/drag-drop';
import find from 'lodash-es/find';
import remove from 'lodash-es/remove';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-market-new-data',
  templateUrl: './market-new-data.component.html',
  styleUrls: ['./market-new-data.component.css']
})

export class MarketNewDataComponent implements OnInit {

  constructor(public globalState: GlobalStateService) { }

  ngOnInit(): void {
  }

}



// export class MarketNewDataComponent implements OnInit {
// 	filters:any = [];
//   dItems: Array<any> = [  
//   ]
// 	selectedFilter ='';
// 	selectedIndex = null;
// 	selectIndexesData = [
// 		{
// 			key: 'market_data',
// 			name: 'Market Data',
// 			value : ["NewPrice","PrevPrice","PrevPrevPrice","NewVolume","PrevVolume","PrevPrevVolume","MarketCap"],
// 		},
// 		{
// 			key: 'test_data',
// 			name: 'Test Data',
// 			value : ["NewPrice","PrevPrice","PrevPrevPrice"],
// 		}
// 	];

//   chartOption = {};

//   constructor(public globalState: GlobalStateService, private http: HttpClient) { }
	
//   ngOnInit(): void {
//   }

// 	onChangeSelectedIndex(e : any) {
// 		console.log('here', e.target.value)
// 		this.chartOption = {};
// 		this.selectedIndex = e.target.value;
		
// 		if(e.target.value != '') {
// 			let selected : any = this.selectIndexesData.find(elem=> elem.key == e.target.value);
// 			if(selected != undefined) {
// 				this.filters = selected.value;
// 			}
// 			else {
// 				this.filters = [];
// 			}
// 		}
// 		else {
// 			this.filters = [];
// 		}
// 	}

// 	getApiData() {
// 		console.log('getApiData');
// 		let apiUrl = 'https://makcorp-test-deployment.es.us-west1.gcp.cloud.es.io:9243/marketdata_public/_search';

// 		let headers = new HttpHeaders({
// 			'Accept': 'application/json',
// 			'Content-Type': 'application/json',
// 			'Authorization': 'Basic ZWxhc3RpYzpOMEUxVFpOSE5LaER1d3p5MW5OWFNHdE8=' });

// 		let options = { headers: headers };
// 		let body: any = JSON.stringify(this.getApiBody());
// 		this.http.post<any>(apiUrl, body, options).subscribe(result => {
// 			this.getChartData(result.aggregations['ab75adad-2356-4707-b2fa-83d748382b14'].buckets);
// 		})
	
// 	}

// 	getApiBody () {
// 		console.log('getApiBody');
// 		return {
//       "aggs": {
//         "ab75adad-2356-4707-b2fa-83d748382b14": {
//           "terms": {
//             "field": "ASX.keyword",
//             "order": {
//               "eb6a9c08-8120-4e58-b25a-d65464e38586.50": "desc"
//             },
//             "size": 25
//           },
//           "aggs": {
//             "eb6a9c08-8120-4e58-b25a-d65464e38586": {
//               "percentiles": {
//                 "field": `${this.selectedFilter}`,
//                 "percents": [
//                   50
//                 ]
//               }
//             },
//             "9dbc0c10-10c6-4bb7-a565-ccaa3bb0637a": {
//               "date_histogram": {
//                 "field": "Changed",
//                 "calendar_interval": "1w",
//                 "time_zone": "Asia/Calcutta"
//               },
//               "aggs": {
//                 "eb6a9c08-8120-4e58-b25a-d65464e38586": {
//                   "percentiles": {
//                     "field": `${this.selectedFilter}`,
//                     "percents": [
//                       50
//                     ]
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//       "size": 0,
//       "fields": [
//         {
//           "field": "@timestamp",
//           "format": "date_time"
//         },
//         {
//           "field": "Changed",
//           "format": "date_time"
//         },
//         {
//           "field": "EDITDATE",
//           "format": "date_time"
//         }
//       ],
//       "script_fields": {},
//       "stored_fields": [
//         "*"
//       ],
//       "runtime_mappings": {},
//       "_source": {
//         "excludes": []
//       },
//       "query": {
//         "bool": {
//           "must": [],
//           "filter": [
//             {
//               "match_all": {}
//             },
//             {
//               "match_all": {}
//             },
//             {
//               "range": {
//                 "Changed": {
//                   "gte": "2020-07-23T09:17:38.371Z",
//                   "lte": "2021-07-23T09:17:38.371Z",
//                   "format": "strict_date_optional_time"
//                 }
//               }
//             }
//           ],
//           "should": [],
//           "must_not": []
//         }
//       }
//     }
// 	}

// 	getChartData (buckets: any) {
// 		console.log('getChartData');
// 		console.log('buckets ', buckets)

// 		let chartDatasets : any = [];
// 		let xAxisInterval : any = [];
// 		let dataName : any = [];

// 		if(buckets.length) {
// 			for(let i=0;i< buckets.length; i++) {
// 				let bucketData : any = [];

// 				for(let j=0;j< buckets[i]['9dbc0c10-10c6-4bb7-a565-ccaa3bb0637a'].buckets.length; j++) {
// 					let keyString = buckets[i]['9dbc0c10-10c6-4bb7-a565-ccaa3bb0637a'].buckets[j].key_as_string;
// 					let keyVal = buckets[i]['9dbc0c10-10c6-4bb7-a565-ccaa3bb0637a'].buckets[j]['eb6a9c08-8120-4e58-b25a-d65464e38586'].values["50.0"];

// 					if(i == 0) {
// 						xAxisInterval.push(this.convertDate(keyString));	
// 					}
// 					// keyString = moment(keyString).format('YYYY-MM-DD');
// 					bucketData.push(keyVal);	
// 				}

// 				dataName.push(buckets[i].key);
// 				chartDatasets.push({
// 					name: buckets[i].key,
// 					data: bucketData,
// 					type: 'line',
// 				})
// 			}
	
// 			console.log('chartDatasets ', chartDatasets);

// 			this.chartOption = {
// 				legend: {
// 					data: dataName,
// 					align: 'right',
// 				},
// 				xAxis: {
// 					type: 'category',
// 					data: xAxisInterval,				
// 				},
// 				yAxis: {
// 					type: 'value'
// 				},
// 				tooltip: {
// 					order: 'valueDesc',
// 					trigger: 'axis'
// 				},		
// 				series: chartDatasets
// 			}
// 		}

// 		console.log('chartDatasets ', chartDatasets);
// 	}

// 	drop(event:any) {
// 		console.log('drop ', event);
// 		console.log('event.previousContainer.id ', event.previousContainer.id);

// 		if (event.previousContainer.id === 'graph_area') {
//       event.container.data.splice(event.currentIndex, 0,
//         event.previousContainer.data[event.previousIndex]);
//     }		

//     // if (event.previousContainer === event.container) {
// 		// 	console.log('wrong')
//     //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     // } else {
// 		// 	console.log('right')
//     //   transferArrayItem(event.previousContainer.data,
//     //                     event.container.data,
//     //                     event.previousIndex,
//     //                     event.currentIndex);
//     // }
//   }

//   /** Predicate function that doesn't allow items to be dropped into a list. */
//   noReturnPredicate() {
// 		console.log('noReturnPredicate');
//     return false;
//   }


//   destinationDropped(event: CdkDragDrop<string[]>) {
// 		console.log('destinationDropped')
// 		console.log('event.previousContainer.data ', event.previousContainer.data)
// 		console.log('event.container.data ', event.container.data)
// 		console.log('event.previousIndex ', event.previousIndex)
// 		console.log('event.currentIndex ', event.currentIndex)

// 		console.log('event.previousContainer.data ', event.previousContainer.data)

//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       copyArrayItem(event.previousContainer.data,
//                         event.container.data,
//                         event.previousIndex,
//                         event.currentIndex);
// 			let filterIndex = event.previousIndex;		
// 			this.selectedFilter = this.filters[filterIndex];
// 			this.getApiData();
//     }

//     if (event.previousContainer.data) {
//       remove(this.filters, { temp: true });
//     }
//   }

//   onSourceListExited(event: CdkDragExit<any>) {
// 		console.log('onSourceListExited')
//     // this.filters.splice(event.container.getItemIndex(event.item) + 1, 0, { ... event.item.data, temp: true });
//   }

//   onSourceListEntered(event: CdkDragEnter<any>) {
// 		console.log('onSourceListEntered')

//     remove(this.filters, { temp: true });
//   }	

// 	convertDate(date:any) {
// 		if (date !== null) {
// 			var jsDate = new Date(date);
// 			let year = "" + jsDate.getFullYear();
// 			let month = "" + (jsDate.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
// 			let day = "" + jsDate.getDate(); if (day.length == 1) { day = "0" + day; }
// 			let hour = "" + jsDate.getHours(); if (hour.length == 1) { hour = "0" + hour; }
// 			let minute = "" + jsDate.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
// 			let second = "" + jsDate.getSeconds(); if (second.length == 1) { second = "0" + second; }
// 			return year + "-" + month + "-" + day;
// 		}
// 		else {
// 			return null;
// 		}
// 	}
// }
