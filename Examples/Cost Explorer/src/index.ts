import { CostExplorer } from "./entities/CostExplorer";
import { Customer } from "./entities/Customer";
import { Subscription } from "./entities/Subscription";
import { Product } from "./entities/Product";
import { CustomerRepository } from "./entities/CustomerRepository";
import { TierType } from "./constants";

async function main(): Promise<void> {
  const customerRepository = new CustomerRepository();

  const p1 = new Product("Jira", {
    BASIC: 10,
    STANDARD: 10
  });
  const p2 = new Product("Jira", {
    BASIC: 20,
    STANDARD: 20
  });


  const cust = new Customer("1", "Piyush");
  customerRepository.addCustomer(cust);
  cust.addSubscription(new Subscription(p1, TierType.BASIC))
  cust.addSubscription(new Subscription(p2, TierType.STANDARD))

  const costExplorer = new CostExplorer(customerRepository);
  costExplorer.getCost("1");
}

main();
