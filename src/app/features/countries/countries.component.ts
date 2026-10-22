import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  CountryConfig,
  CountryService,
} from "../../core/services/country.service";
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./countries.component.html",
  styleUrls: ["./countries.component.scss"],
})
export class CountriesComponent implements OnInit {
  private countryService = inject(CountryService);
  private fb = inject(FormBuilder);
  readonly countries = signal<CountryConfig[]>([]);
  readonly converter = this.fb.nonNullable.group({
    amount: [100, [Validators.required, Validators.min(0)]],
    currency: ["USD", Validators.required],
  });
  equivalent(): number {
    const amount = Number(this.converter.controls.amount.value) || 0;
    const currency = this.converter.controls.currency.value;
    const c = this.countries().find((v) => v.currency === currency);
    return amount * (c?.rate ?? 1);
  }
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.countryService
      .getAll()
      .subscribe({
        next: (rows) => this.countries.set(rows ?? []),
        error: () => alert("Unable to load countries from backend."),
      });
  }
  updateRate(code: string, rate: number): void {
    if (!Number.isFinite(rate) || rate < 0) return;
    this.countryService
      .updateRate(code, rate)
      .subscribe({
        next: (updated) =>
          this.countries.update((cs) =>
            cs.map((c) => (c.code === code ? updated : c)),
          ),
        error: () =>
          alert("Unable to save exchange rate. Please check the backend."),
      });
  }
  addCountry(): void {
    alert(
      "Country creation is not exposed by the current backend API. Add a POST /api/countries endpoint before enabling country creation.",
    );
  }
}
