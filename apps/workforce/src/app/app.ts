import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [RouterModule, NzButtonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'workforce';
  constructor(private toastr: ToastrService) {}

  showToast() {
    this.toastr.success('This is a success toast!', 'Success');
  }

  showError() {
    this.toastr.error('Something went wrong!', 'Error');
  }
}
