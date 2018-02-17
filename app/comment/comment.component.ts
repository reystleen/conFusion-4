import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { TextField } from 'ui/text-field';
import { Slider } from 'ui/slider'
import { Page } from 'ui/page';

@Component({
    moduleId: module.id,
    templateUrl: './comment.component.html'
})

export class CommentComponent implements OnInit {

    author: string;
    rating: number;
    comment: string;
    date: string;

    constructor(private params: ModalDialogParams, private page: Page) { }

    ngOnInit() { }

    public onSubmit() {
        
        let authorTextField : TextField = <TextField>this.page.getViewById('author');
        this.author = authorTextField.text;
        let commentTextField : TextField = <TextField>this.page.getViewById('comment');
        this.comment = commentTextField.text;
        let ratingSlider : Slider = <Slider>this.page.getViewById('rating');
        this.rating = ratingSlider.value;
        this.date = new Date().toISOString();

        let form = {
            author: this.author,
            rating: this.rating,
            comment: this.comment,
            date: this.date
        }
        
        this.params.closeCallback(form);
    }
} 