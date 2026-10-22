
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  from: 'user' | 'assistant';
  text: string;
}

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {

  question: string = '';
  language: string = 'en';
  isLoading: boolean = false;

  faqs: FaqItem[] = [
    {
      q: 'How can I manage employee salary records?',
      a: 'Authorized HR managers can maintain employee records and compensation through the PeoplePay application.'
    },
    {
      q: 'How can I compare salaries across countries?',
      a: 'Compare average salaries, median salaries and salary ranges by country, ensuring currencies and reporting periods are consistent.'
    },
    {
      q: 'What is average salary?',
      a: 'Average salary is the sum of salaries divided by the number of employees included in the calculation.'
    },
    {
      q: 'What is median salary?',
      a: 'Median salary is the middle salary value after salaries are sorted from lowest to highest.'
    },
    {
      q: 'How can I review department salary expenditure?',
      a: 'Use aggregate salary reports to compare compensation expenditure across departments and reporting periods.'
    },
    {
      q: 'How can I identify potential pay equity gaps?',
      a: 'Compare compensation across comparable roles and investigate differences using relevant job-related factors.'
    },
    {
      q: 'Can I import salary data from Excel?',
      a: 'A production implementation can support spreadsheet imports with validation, duplicate checks and error reporting.'
    }
  ];

  messages: ChatMessage[] = [
    {
      from: 'assistant',
      text: 'Welcome to PeoplePay Intelligence! Ask me about salary insights, country comparisons, department expenditure or employee distribution.'
    }
  ];

  send(): void {
    const userQuestion: string = this.question.trim();

    if (!userQuestion || this.isLoading) {
      return;
    }

    this.messages.push({
      from: 'user',
      text: userQuestion
    });

    this.question = '';
    this.isLoading = true;

    const response: string = this.getDemoResponse(userQuestion);

    // Local demo response; replace with an API call for production.
    setTimeout((): void => {
      this.messages.push({
        from: 'assistant',
        text: response
      });

      this.isLoading = false;
    }, 400);
  }

  askPrompt(prompt: string): void {
    if (this.isLoading) {
      return;
    }

    this.question = prompt;
    this.send();
  }

  clearChat(): void {
    if (this.isLoading) {
      return;
    }

    this.messages = [
      {
        from: 'assistant',
        text: 'Welcome back! What would you like to know about ACME salary data?'
      }
    ];

    this.question = '';
  }

  private getDemoResponse(input: string): string {
    const text: string = input.toLowerCase();

    if (text.includes('median') || text.includes('average')) {
      return 'Average salary is total salary divided by employee count. Median salary is the middle value in the sorted salary distribution. Connect the backend to retrieve actual ACME figures.';
    }

    if (text.includes('country') || text.includes('countries')) {
      return 'Country comparisons can include employee count, average salary, median salary and total payroll. Currency conversion and consistent reporting periods are important. Actual ACME data is not connected in this demo.';
    }

    if (text.includes('department')) {
      return 'Department analytics can compare employee count, average salary, median salary and total salary expenditure. Actual figures must be retrieved from the database.';
    }

    if (
      text.includes('job title') ||
      text.includes('job level') ||
      text.includes('seniority')
    ) {
      return 'Salary ranges can be grouped by job title, seniority and country. A production report can show minimum, median, average and maximum salary for authorized groups.';
    }

    if (text.includes('equity') || text.includes('pay gap')) {
      return 'Pay equity analysis compares compensation for comparable roles and considers job level, location and other relevant factors. Any identified differences require further HR review.';
    }

    if (
      text.includes('expenditure') ||
      text.includes('payroll')
    ) {
      return 'Salary expenditure reports can summarize annual base salaries by country, department and reporting period. The exact totals must come from the authorized database.';
    }

    if (
      text.includes('employee') &&
      (
        text.includes('count') ||
        text.includes('many') ||
        text.includes('distribution')
      )
    ) {
      return 'Employee distribution reports can group workforce counts by country, department, job title and employment status.';
    }

    if (
      text.includes('excel') ||
      text.includes('import') ||
      text.includes('manage') ||
      text.includes('salary records')
    ) {
      return 'PeoplePay can replace manual Excel workflows with centralized salary records, validated imports, controlled updates and audit logs. These operations must be implemented in the backend.';
    }

    return 'I can help with salary analytics, employee distribution, country comparisons, department expenditure and pay equity. Try selecting one of the suggested questions. This is a demo and does not access live salary data.';
  }
}
