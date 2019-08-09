import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { MatPaginator, MatTableDataSource, MatSliderChange } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.css']
})
export class FlightComponent implements OnInit {

  flightSearchForm: FormGroup;
  displayedColumns: string[] = ['flight_id', 'source', 'destination', 'departs_at', 'arrives_at', 'fare', 'action'];
  dataSource;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  departureAt: string[];
  flightData: any;
  fromCtrl: FormControl;
  filteredFrom: Observable<any[]>;
  destinationCtrl: FormControl;
  filteredDestination: Observable<any[]>;

  autoTicks = false;
  disabled = false;
  invert = false;
  max = 20000;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = true;
  value = 0;
  vertical = false;

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    this.fromCtrl = new FormControl();
    this.destinationCtrl = new FormControl();
  }

  ngOnInit() {
    this.getFilghtData();
    this.flightSearchForm = this.formBuilder.group({
      flightFrom: [, Validators.required],
      flightDestination: [, Validators.required],
      departureDate: [, Validators.required],
      passenger: ['1', [Validators.pattern("^[0-9]*$")]]
    });
  }

  getFilghtData() {
    try {
      this.http.get('./assets/flights.json').subscribe((res: any) => {
        console.log("flight data", res);
        this.flightData = res;
        var depart_at = [];
        res.forEach(ele => {
          depart_at.push(ele.departs_at);
        });
        this.departureAt = depart_at.filter((el, i, a) => i === a.indexOf(el));

        this.filteredFrom = this.fromCtrl.valueChanges
          .pipe(
            startWith(''),
            map(fromData => this.filterFromData(fromData))
          );

        this.filteredDestination = this.destinationCtrl.valueChanges
          .pipe(
            startWith(''),
            map(fromData => this.filterDestinationData(fromData))
          );
      })
    } catch (e) {
      console.log("error", e);
    }
  }

  onPriceChange(event: MatSliderChange) {
    var priceChangeFlightData = this.flightData.filter(ele => event.value >= parseInt(ele.fare));
    this.dataSource = new MatTableDataSource(priceChangeFlightData);
    this.dataSource.paginator = this.paginator;
  }


  finalFlightData: any;
  onSubmit() {
    this.finalFlightData = this.flightData.filter(ele => ( ele.source == this.flightSearchForm.value.flightFrom && ele.destination == this.flightSearchForm.value.flightDestination && ele.departs_at == this.flightSearchForm.value.departureDate));
    this.dataSource = new MatTableDataSource(this.finalFlightData);
    this.dataSource.paginator = this.paginator;
  }

  filterFromData(name: string) {
    var fromData = [];
    this.flightData.forEach(ele => {
      fromData.push(ele.source);
    });
    var finalFromData = fromData.filter((el, i, a) => i === a.indexOf(el));
    return finalFromData.filter(ele =>
      ele.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterDestinationData(name: string) {
    var destinationData = [];
    this.flightData.forEach(ele => {
      destinationData.push(ele.destination);
    });
    var finaldestinationData = destinationData.filter((el, i, a) => i === a.indexOf(el));
    return finaldestinationData.filter(ele =>
      ele.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  onSelect(event: any){
    console.log(event);
    this.flightSearchForm.patchValue({
      flightFrom: event
    })
  }

  onSelectdestination(event: any){
    console.log(event);
    this.flightSearchForm.patchValue({
      flightDestination: event
    })
  }

}
