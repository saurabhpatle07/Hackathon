import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-temperature-graph',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './temperature-graph.component.html',
    styleUrls: ['./temperature-graph.component.css']
})
export class TemperatureGraphComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('temperatureChart') private chartRef!: ElementRef;
    private chart: Chart | null = null;
    private socket: WebSocket | null = null;
    isConnected: boolean = false;

    // Store last 20 data points
    private labels: string[] = [];
    private dataPoints: number[] = [];
    private readonly MAX_POINTS = 20;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.connectWebSocket();
    }

    ngAfterViewInit(): void {
        this.initChart();
    }

    ngOnDestroy(): void {
        if (this.socket) {
            this.socket.close();
        }
        if (this.chart) {
            this.chart.destroy();
        }
    }

    private initChart(): void {
        console.log('Initializing chart...');
        if (!this.chartRef) {
            console.error('Canvas ref not found!');
            return;
        }
        const ctx = this.chartRef.nativeElement.getContext('2d');
        console.log('Canvas context:', ctx);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: this.dataPoints,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }

    private connectWebSocket(): void {
        const token = this.authService.getToken();
        if (!token) {
            console.error('No token found, cannot connect to WebSocket');
            return;
        }
        this.socket = new WebSocket(`ws://localhost:8000/ws/temperature?token=${token}`);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateChart(data);
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket disconnected', event.code, event.reason);
            this.isConnected = false;

            // Do not reconnect if policy violation (1008) or normal closure (1000)
            if (event.code === 1008 || event.code === 1000) {
                console.error('WebSocket connection rejected or closed normally. Not reconnecting.');
                return;
            }

            // Try to reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private updateChart(data: any): void {
        const time = new Date().toLocaleTimeString();
        const temp = data.temperature;

        this.labels.push(time);
        this.dataPoints.push(temp);

        if (this.labels.length > this.MAX_POINTS) {
            this.labels.shift();
            this.dataPoints.shift();
        }

        if (this.chart) {
            this.chart.update();
        }
    }
}
