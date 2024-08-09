import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CaregiverService } from '../caregivers/caregiver.service';
import { ClientsOfficesSummary, TerritoryOptionSummary } from '../models/office';
import { AgencyService } from '../services/agency.service';
import { ClientService } from '../clients/client.service';
import { ClientOptionSummary } from '../models/client';
import { PayerService } from '../payers/payer.service';
import { Payer, PayerOptionSummary } from '../models/payer';
import { DDMItem, DDMItemOptionSummary } from '../models/ddm';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceOfficeDateSetting } from '../models/invoice';
import { SelectionModel } from '@angular/cdk/collections';
import { v4 } from 'uuid';
import { CsTooltip } from '../components/cs-tooltip/cs-tooltip.component';
import * as moment from 'moment';
import { ScheduleStatusType } from '../models/schedule';
import { ToasterService } from '../services/toaster.service';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
})

export class CreateInvoiceComponent implements OnInit {


  @ViewChild('createInvoice')
  createInvoice: CsTooltip;

  createInvoiceElement: ElementRef;

  filtericons: boolean = true;
  jumpData: any;
  visible: boolean = false
  panelOpenState = false;
  isShowFilter?: boolean = false;
  invoiceFiltersValues: any;

  officesList: ClientsOfficesSummary[] = [];
  officeIds: any[] = [];
  territoryList: TerritoryOptionSummary[] = [];
  territoriesIds: any[] = [];
  clientList: ClientOptionSummary[] = [];
  clientSearchKeyword: string;
  payerList: PayerOptionSummary[];
  payerSearchKeyword: string;
  serviceItems: DDMItemOptionSummary[] = [];
  selectedServiceItem: DDMItemOptionSummary;
  InvoiceStatusItems: DDMItemOptionSummary[] = [];
  selectedInvoiceStatusItem: DDMItemOptionSummary;
  invoiceDateOfficeSettingData: any;

  constructor(
    private el: ElementRef,
    private caregiverService: CaregiverService,
    private agencyService: AgencyService,
    private clientService: ClientService,
    private payerService: PayerService,
    private invoiceService: InvoiceService
  ) {

  }

  clientData = false;

  invoiceCreateDate: Date | string = moment().format('YYYY-MM-DDTHH:mm:ss');

  offices = [
    { id: 1, office: 'Marina Bay Office', amount: 240.00, payers: 6, clients: 5 },
    { id: 2, office: 'Rochester Office', amount: 240.00, payers: 6, clients: 5 },
    { id: 3, office: 'Canada Shore Office', amount: 240.00, payers: 6, clients: 5 },
  ]

  selectedUpdateInvoiceId: string;

  showCreateInvoice: boolean = false;

  showUpdateInvoice: boolean = false;

  updateInvoiceStatus: ScheduleStatusType[] =
    [
      {
        "scheduleStatusId": "62e444af-b001-4416-b7ff-d9787fd034d7",
        "scheduleStatusName": "Approved"
      },

      {
        "scheduleStatusId": "5b24c8ba-d0a4-4812-b3a7-24e6254ba024",
        "scheduleStatusName": "Timetracking Confirmed"
      },
      {
        "scheduleStatusId": "471781e0-fd00-47ac-b66d-7ca8c7911b2d",
        "scheduleStatusName": "Needs Review"
      },
      {
        "scheduleStatusId": "7d78ff48-52f7-480f-b780-a865842ba299",
        "scheduleStatusName": "Scheduled"
      },

    ];

  obj = {
    client: 'William , John',
    payer: 'Kolitic , Jorica',
    amount: 'XXX.XX',
    isExpand: false,
    address: [
      { caregiver: 'zli, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },
      { caregiver: 'Ali, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },
      { caregiver: 'zli, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },
      { caregiver: 'Ali, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },
      { caregiver: 'zli, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },
      { caregiver: 'Ali, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },
      { caregiver: 'zli, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },
      { caregiver: 'Ali, Alzari', scheduleTime: '06/24 8am-12:30pm', serviceType: 'Assistance', status: 'Approved', payableAmount: '159.65', totalAmount: '259.65' },

    ]
  }

  officeNewArray = new Array(400).fill(this.obj);

  toggle() {
    this.officeNewArray.forEach((x) => (x.isExpand = !x.isExpand));
  }

  ngOnInit() {
    this.getOffices();
    this.getServiceType();
    this.getInvoiceStatus();
  }

  openMenuFilterEvent(value) {
    this.isShowFilter = false;
  }

  fetchFiltersValues(item) {
    console.log(item);
    this.invoiceFiltersValues = item;
  }

  getOffices() {
    this.caregiverService.getCaregiversOffices().subscribe((offices: any) => {
      if (offices?.length && offices?.length < 1) {
        this.getInvoiceDateByOfficeSetting(offices[0]?.id);
      }
      if (offices?.length) {
        this.officesList = offices.map(office => ({ ...office, selected: true, currentlySelected: true }));
        this.officeIds = this.officesList.map(office => office.officeId) || [];
        this.getTerritoryList();
        this.getPayerLists();
      }
    })
  }

  getTerritoryList() {
    this.agencyService.getTerritoryFilterOptions(this.officeIds).subscribe((territories: TerritoryOptionSummary[]) => {
      this.territoryList = territories.map(territory => ({ ...territory, selected: true, currentlySelected: true }));
      this.territoriesIds = this.territoryList.map(territory => territory.territoryId) || [];
      this.getClientsLists();
    });
  }

  searchClient(value) {
    if (value?.length) {
      this.clientSearchKeyword = value;
      this.getClientsLists();
    }
  }

  getClientsLists() {
    let body = {
      OfficeId: this.officeIds || [],
      TerritoryId: this.territoriesIds || [],
      keyword: this.clientSearchKeyword || 'ALL'
    }
    this.clientService.getClientsLists(body).subscribe((clientItems: ClientOptionSummary[]) => {
      this.clientList = [...clientItems.map(client => ({ ...client, selected: true, currentlySelected: true }))];
      console.log(this.clientList);
    });
  }

  searchPayer(value) {
    if (value?.length) {
      this.payerSearchKeyword = value;
      this.getPayerLists();
    }
  }

  getPayerLists() {
    let body = {
      OfficeId: this.officeIds || [],
      keyword: this.payerSearchKeyword || 'ALL'
    }
    this.payerService.getPayerLists(body).subscribe((payerItems: Payer[]) => {
      this.payerList = payerItems.map(payer => ({ ...payer, selected: true, currentlySelected: true }));
    });
  }

  getServiceType() {
    this.agencyService.getDDMValues('ServiceType').subscribe((data: DDMItemOptionSummary[]) => {
      this.serviceItems = data.map(item => ({ ...item, selected: true, currentlySelected: true }));
    })
  }

  getInvoiceStatus() {
    this.agencyService.getDDMValues('InvoiceStatus').subscribe((data: DDMItemOptionSummary[]) => {
      this.InvoiceStatusItems = data.map(item => ({ ...item, selected: true, currentlySelected: true }));
    })
  }

  officeDateSettingCall(event){
    console.log(event);
    // this.getInvoiceDateByOfficeSetting(item.officeId);
  }

  getInvoiceDateByOfficeSetting(officeId) {
    let body = {
      OfficeId: officeId,
    }
    this.invoiceService.getInvoiceOfficeDateSetting(body).subscribe((data: InvoiceOfficeDateSetting) => {
      console.log(data);
      this.invoiceDateOfficeSettingData = data;
    });
  }

  toggleTableRows() {
    // this.data.forEach((x) => (x.isExpand = !x.isExpand));
  }

  jumptoSection(section) {
    let element = document.getElementById(section);
    element.scrollIntoView({ behavior: 'smooth' });
  }

  trackByIndex(index, item) {
    return index;
  }
  selection = new SelectionModel<any>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.officeNewArray.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.officeNewArray.forEach(row => this.selection.select(row));
  }

  createInvoiceFun(event, type: "createInvoice" | "updateInvoice") {
    if (type === 'createInvoice') {
      this.showCreateInvoice = true;
      this.showUpdateInvoice = false;
      this.createInvoiceElement = event.target;
    }
    else {
      this.showCreateInvoice = false;
      this.showUpdateInvoice = true;
      this.createInvoiceElement = event.target;
    }
    setTimeout(() => {
      this.createInvoice.openDialog();
    }, 0)
  }

  closedInvoiceCreate(type: "invoiceCreate" | "updateInvoice") {
    if (type === 'invoiceCreate') {
      this.createInvoice.closeModal();
    }
  }

  saveInvoice() {
    // create Invoice if all is approved;
  }

  changeInvoiceCreateDate(event) {
    this.invoiceCreateDate = event.tagret.value;
  }


  updateInvoiceStatusHandler(event) {
    this.selectedUpdateInvoiceId = event.value;
  }

  updateInvoiceStatusApply() {

  }


}
