import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { evaluate, format } from 'mathjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  expression = signal<string>('');
  result = signal<string>('0');
  shiftActive = signal<boolean>(false);
  alphaActive = signal<boolean>(false);
  ans = signal<string>('0');

  toggleShift() {
    this.shiftActive.update(v => !v);
    this.alphaActive.set(false);
  }

  toggleAlpha() {
    this.alphaActive.update(v => !v);
    this.shiftActive.set(false);
  }

  append(value: string) {
    if (this.result() !== '0' && this.expression() === '') {
       if (['+', '-', '*', '/', '^'].includes(value)) {
           this.expression.set(this.ans() + value);
           this.result.set('0');
           return;
       } else {
           this.result.set('0');
       }
    }
    
    this.expression.update(exp => exp + value);
  }

  appendFunction(funcName: string) {
    this.append(funcName + '(');
  }

  clear() {
    this.expression.set('');
    this.result.set('0');
    this.shiftActive.set(false);
    this.alphaActive.set(false);
  }

  delete() {
    if (this.expression().length > 0) {
      this.expression.update(exp => exp.slice(0, -1));
    }
  }

  calculate() {
    try {
      let exp = this.expression();
      if (!exp) return;
      
      // Basic substitutions to match mathjs syntax
      exp = exp.replace(/×/g, '*').replace(/÷/g, '/').replace(/Ans/g, this.ans());
      exp = exp.replace(/π/g, 'pi');
      
      const res = evaluate(exp);
      const formattedRes = format(res, { precision: 10 });
      this.result.set(formattedRes);
      this.ans.set(formattedRes);
      // Keep expression visible after equals
      this.expression.set(''); 
    } catch (e) {
      this.result.set('Math ERROR');
      this.expression.set('');
    }
  }

  // Keyboard support for ease of use
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key;
    if (/[0-9\.\+\-\*\/\(\)\^]/.test(key)) {
      this.append(key);
    } else if (key === 'Enter' || key === '=') {
      this.calculate();
    } else if (key === 'Backspace') {
      this.delete();
    } else if (key === 'Escape') {
      this.clear();
    }
  }
}
