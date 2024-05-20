import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Task } from './models/task.model';
import { TasksService } from './services/tasks.service';
import { faCheck, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { NgScrollbar } from 'ngx-scrollbar/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  faCheck = faCheck;
  faPenToSquare = faPenToSquare;
  @ViewChild('scrollbar') scrollbar!: NgScrollbar;
  title = 'CRUD APP';
  tasks: Task[] = [];
  poruka!: string;
  task: Task = {
    taskID: '',
    taskDescription: ''
  }
  constructor(private tasksService: TasksService) {

  }
  scrollToBottom() {
    setTimeout(() => {
      this.scrollbar.scrollTo({ bottom: 0, duration: 1000 });
    }, 100);
  }
  scrollToTop() {
    this.scrollbar.scrollTo({ top: 0 });
  }
  ngOnInit(): void {
    this.getAllTasks();
  }
  getAllTasks() {
    this.tasksService.getAllTasks()
      .subscribe(
        response => {
          if (response.length === 0) {
            this.tasks = [];
            this.poruka = "No Tasks"
          } else {
            this.tasks = response;
          }
        }
      );
  }
  onSubmit() {
    if (this.task.taskID === "") {
      this.tasksService.addCard(this.task)
        .subscribe(
          response => {
            this.getAllTasks();
            this.task = {
              taskID: '',
              taskDescription: ''
            }
          }
        )
      this.scrollToBottom();
      this.poruka = ""
    }
    else {
      this.updateCard(this.task);
    }
  }
  deleteTask(id: string) {
    this.tasksService.deleteTask(id).subscribe(
      response => {
        this.getAllTasks();
        this.task = {
          taskID: '',
          taskDescription: ''
        }
        this.scrollToTop();
      }
    )
  }
  populateForm(task: Task) {
    this.task = task;
  }
  updateCard(task: Task) {
    this.tasksService.updateTask(task).subscribe(response => {
      this.getAllTasks();
      this.task = {
        taskID: '',
        taskDescription: ''
      }
    })
    this.scrollToTop();
  }
}

