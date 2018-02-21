import { Component, OnInit, ChangeDetectorRef, ViewContainerRef } from "@angular/core";
import { DrawerPage } from '../shared/drawer/drawer.page';
import { TextField } from "ui/text-field";
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Switch } from 'ui/switch';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { ReservationModalComponent } from '../reservationmodal/reservationmodal.component';
import { Page } from 'ui/page';
import { View } from 'ui/core/view';
import { SwipeGestureEventData, SwipeDirection } from 'ui/gestures';
import { Animation, AnimationDefinition } from 'ui/animation';
import * as enums from 'ui/enums';
import { DatePipe } from "@angular/common";
import { CouchbaseService } from '../services/couchbase.service';

@Component({
    selector: 'app-reservation',
    moduleId: module.id,
    templateUrl: './reservation.component.html'
})

export class ReservationComponent extends DrawerPage implements OnInit{

    reservation: FormGroup;
    showForm: boolean=true;
    reservationFormView: View;
    dataFormView: View;
    docId: string = "reservation";
    reserve : Array<any>
    g: string;
    s: string="false";
    di : string;    

    constructor(private changeDetectorRef: ChangeDetectorRef,
                private formBuilder: FormBuilder,
                private modalService : ModalDialogService,
                private page: Page,
                private couchbaseservice: CouchbaseService,
                private vcRef: ViewContainerRef){ 
            super(changeDetectorRef);
            this.reserve = [];

            this.reservation = this.formBuilder.group({
                guests : 3,
                smoking: false,
                dateTime: ['', Validators.required]
            });

            let doc = this.couchbaseservice.getDocument(this.docId);
            if (doc==null){
                this.couchbaseservice.createDocument({"reservation":[]}, this.docId);
            }else{
                this.reserve = doc.reservation;
            }
        }
    ngOnInit(){ }

    createModalView(args){

        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: args,
            fullscreen: false
        };

        this.modalService.showModal(ReservationModalComponent, options)
            .then((result: any) =>{
                if(args==='guest') {
                    this.reservation.patchValue({guests: result});
                }
                else if(args === 'date-time'){
                    this.reservation.patchValue({dateTime: result});
                }
            });
        
    }

    onGuestChange(args){
        let textfield = <TextField>args.object;
        this.reservation.patchValue({ guests : textfield.text});
        this.g=textfield.text;       
    }

    onSmokingChecked(args){
        let smokingSwitch = <Switch>args.object;
        if(smokingSwitch.checked) {
            this.reservation.patchValue({smoking: true});
            this.s = 'true';
        }
        else{
            this.reservation.patchValue({smoking: false});
            this.s = 'false';
        }
    }

    onDateTimeChange(args){
        let textfield = <TextField>args.object;
        this.reservation.patchValue({dateTime: textfield.text});
        this.di = textfield.text;
    }

    onSubmit() {
        console.log(JSON.stringify(this.reservation.value));   
        this.reserve.push(JSON.stringify(this.reservation.value));
        this.couchbaseservice.updateDocument(this.docId, {"reservation":this.reserve});  
        console.log(JSON.stringify(this.couchbaseservice.getDocument(this.docId)));
        if (this.showForm ) {
            this.animateOnSubmit();
        }
    }

    animateOnSubmit(){
        this.reservationFormView = this.page.getViewById<View>("reservationFormView");
        this.dataFormView = this.page.getViewById<View>("dataFormView");  
        this.reservationFormView.animate({
            opacity: 0,
            scale: { x:0, y:0},
            duration: 500,
            curve: enums.AnimationCurve.easeInOut
        }).then(()=> {
            this.showForm=false;
            this.dataFormView.animate({
                opacity:1,
                scale: {x:1, y:1},
                duration:500,
                curve: enums.AnimationCurve.easeInOut
            });
        });

    }

}