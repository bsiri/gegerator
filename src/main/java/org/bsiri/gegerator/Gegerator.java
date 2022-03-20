package org.bsiri.gegerator;

import org.bsiri.gegerator.repositories.MovieRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class Gegerator {

	public static void main(String[] args) {
		ApplicationContext context = SpringApplication.run(Gegerator.class, args);

		context.getBean(MovieRepository.class);


	}



}
