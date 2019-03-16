class MLP {

	constructor(input, hidden, output, learningRate = 0.1, iterations = 100){
		
		this.inputsToHidden = new Matrix(hidden, input, "RANDOM");
		
		this.biasInputsToHidden = new Matrix(hidden, 1, "RANDOM");
		
		this.hiddenToOutputs = new Matrix(output, hidden, "RANDOM");
		
		this.biasHiddenToOutputs = new Matrix(output, 1, "RANDOM");
		
		this.lr = learningRate;
		
		this.it = iterations;
		
		this.activation = this.sigmoid;
		
		this.dActivation = this.dSigmoid;
		
	}

	predict(inputs){	
	  
		let inputsMatrix = new Matrix(inputs.length, 1, inputs);
		
		let hidden = this.inputsToHidden.multiply( inputsMatrix );

		hidden.add( this.biasInputsToHidden );
		
		hidden.foreach( this.activation );	
		
		let output = this.hiddenToOutputs.multiply( hidden );
		
		output.add( this.biasHiddenToOutputs ) ;
	
		output.foreach( this.activation );
	
		return output;
	
	}

	fit(inputs, labels){
		let it = 0;
		while( it < this.it ){
			for(let i = 0; i < inputs.length; i++){

				const input = new Matrix( inputs[i].length, 1, inputs[i] );
				const hidden = this.inputsToHidden.multiply( input );
				hidden.add( this.biasInputsToHidden );
				hidden.foreach( this.activation );
				
				const outputs = this.hiddenToOutputs.multiply( hidden );
				outputs.add( this.biasHiddenToOutputs );
				outputs.foreach( this.activation );
				
				const outputErrors = new Matrix( labels[i].length, 1, labels[i] );
				
				outputErrors.subtract( outputs );	
				
				outputs.foreach( this.dActivation );
				outputs.hadamard( outputErrors );
				outputs.scalar( this.lr );
				
				hidden.transpose();
				
				const hiddenToOutputsDeltas = outputs.multiply( hidden );
				
				hidden.transpose();
				
				this.hiddenToOutputs.add( hiddenToOutputsDeltas );
				this.biasHiddenToOutputs.add( outputs );
				
				this.hiddenToOutputs.transpose();
				
				const hiddenErrors = this.hiddenToOutputs.multiply( outputErrors );
				
				this.hiddenToOutputs.transpose();
				
				hidden.foreach( this.dActivation );
				hidden.hadamard( hiddenErrors );
				hidden.scalar( this.lr );
				
				input.transpose();
				
				const inputsToHiddenDeltas = hidden.multiply( input );
				
				this.inputsToHidden.add( inputsToHiddenDeltas );
				this.biasInputsToHidden.add( hidden );
				

			}
			it++;
		};
	}

	shuffle(x,y){
		for(let i = 0; i < y.length; i++){
			let pos = Math.floor( Math.random() * y.length );
			let tmpy = y[i];
			let tmpx = x[i];
			y[i] = y[pos];
			x[i] = x[pos];
			y[pos] = tmpy;
			x[pos] = tmpx;
		}
	}

	save(){
		let nn = {
			inputsToHidden: { 
				rows: this.inputsToHidden.rows,
				cols: this.inputsToHidden.cols,
				data: this.inputsToHidden.data
			},
		
			biasInputsToHidden: { 
				rows: this.biasInputsToHidden.rows,
				cols: this.biasInputsToHidden.cols,
				data: this.biasInputsToHidden.data
			},
		
			hiddenToOutputs: { 
				rows: this.hiddenToOutputs.rows,
				cols: this.hiddenToOutputs.cols,
				data: this.hiddenToOutputs.data
			},
		
			biasHiddenToOutputs: { 
				rows: this.biasHiddenToOutputs.rows,
				cols: this.biasHiddenToOutputs.cols,
				data: this.biasHiddenToOutputs.data
			},
		
			lr: this.lr,
		
			it: this.it,
		
			activation: 'sigmoid',
		
			dActivation: 'dSigmoid'
		};
		let blob = new Blob([JSON.stringify(nn)], {type: 'text/json'});
		let link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = 'nn.json';
		link.click();
	}

	load(nn){
		
		this.inputsToHidden = new Matrix(
			nn.inputsToHidden.rows, 
			nn.inputsToHidden.cols,
			nn.inputsToHidden.data
		);
		
		this.biasInputsToHidden = new Matrix(
			nn.biasInputsToHidden.rows, 
			nn.biasInputsToHidden.cols,
			nn.biasInputsToHidden.data
		);
		
		this.hiddenToOutputs = new Matrix(
			nn.hiddenToOutputs.rows, 
			nn.hiddenToOutputs.cols,
			nn.hiddenToOutputs.data
		);
		
		this.biasHiddenToOutputs = new Matrix(
			nn.biasHiddenToOutputs.rows, 
			nn.biasHiddenToOutputs.cols,
			nn.biasHiddenToOutputs.data
		);
		
		this.lr = nn.lr;
		
		this.it = nn.it;
		
		console.log( "loaded" );
	}
	
	softmax(x){
		/* expect a vector instead of single input */
		if( !(x instanceof Array) )
			return null;
			
		let sum = 0;
		for(let i = 0; i < x; i++){
			sum += Math.exp(x[i]);
		}
		for(let i = 0; i < x; i++){
			x[i] = Math.exp(x) / sum;
		}
		return x;
	}
	
	dSoftmax(labels, x){
		/* expect a vectors instead of single inputs */
		if( !(x instanceof Array) )
			return null;
			
		for(let i = 0; i < x.length; i++){
			x[i] = labels[i] - x;
		}
		return x;
	}

	sigmoid(x){
		return 1 / ( 1 + Math.exp(-x) );
	}
	
	dSigmoid(x){
		return x * (1 - x);
	}

	tanh(x){
		return Math.tanh(x);
	}

	dTanh(x){
		return 1 - ( x * x );
	}
	
	relu(x){
		return Math.max(0,x);
	}

	dRelu(x){
		return x > 0 ? 1 : 0;
	}

}
