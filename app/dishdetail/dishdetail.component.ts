import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';
import { FavoriteService } from '../services/favorite.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { CommentComponent } from '../comment/comment.component';

import { ActivatedRoute, Params } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';
import 'rxjs/add/operator/switchMap';
import { Toasty } from 'nativescript-toasty';
import { action } from "ui/dialogs";
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";

@Component({
  selector: 'app-dishdetail',
    moduleId: module.id,
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.css']
})

export class DishdetailComponent implements OnInit {

  dish: Dish;
  comment: Comment;
  errMess: string;
  avgstars: string;
  numcomments: number;
  favorite: boolean = false;
  commentform: FormGroup;

  constructor(private dishservice: DishService,
    private favoriteservice: FavoriteService,
    private fonticon: TNSFontIconService,
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private formBuilder: FormBuilder,
    private modalService: ModalDialogService, 
    private vcRef: ViewContainerRef,
    @Inject('BaseURL') private BaseURL) { 
      this.commentform = this.formBuilder.group({
        author: '',
        rating: 5,
        comment: ['', Validators.required]
      });
    }

    ngOnInit() {

      this.route.params
        .switchMap((params: Params) => this.dishservice.getDish(+params['id']))
        .subscribe(dish => { 
            this.dish = dish;
            this.favorite = this.favoriteservice.isFavorite(this.dish.id);
            this.numcomments = this.dish.comments.length;
  
            let total = 0;
            this.dish.comments.forEach(comment => total += comment.rating);
            this.avgstars = (total/this.numcomments).toFixed(2);
          },
          errmess => { this.dish = null; this.errMess = <any>errmess; });
    }
  
    addToFavorites() {
      if (!this.favorite) {
        console.log('Adding to Favorites', this.dish.id);
        this.favorite = this.favoriteservice.addFavorite(this.dish.id);
        const toast = new Toasty("Added Dish "+ this.dish.id, "short", "bottom");
        toast.show();
      }
    }

    showCommentModal() {
      let options: ModalDialogOptions = {
        viewContainerRef: this.vcRef, fullscreen: false
      };
  
      this.modalService.showModal(CommentComponent, options)
        .then((result: any) => { this.dish.comments.push(result); });
    }
      
    showActionDialog(){
      let favorites = "Add to Favorites";
      let comment = "Add Comment";
  
      let options = {
        title: "Actions",
        cancelButtonText: "Cancel",
        actions: [favorites, comment]
      };
    
      action(options).then((result) => {
        if (result === favorites) {
          this.addToFavorites();
        } 
        else if (result === comment) {
          this.showCommentModal();
        }
      });
    }

  goBack(): void {
    this.routerExtensions.back();
  }
}