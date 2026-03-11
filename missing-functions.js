        // === SECTION NAVIGATION ===
        function showSection(sectionId) {
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => section.classList.remove('active'));
            
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load relevant data when showing sections
                if (sectionId === 'settingsSection') {
                    loadSettings();
                }
                if (sectionId === 'customersSection') {
                    loadCustomersList();
                }
                if (sectionId === 'newBillSection') {
                    clearBillForm();
                    loadCustomerDropdowns();
                    document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
                }
                if (sectionId === 'historySection') {
                    loadFilteredHistory();
                }
            }
        }

        // === PRINT & DELETE ===
        function printBill(bill) {
            const customers = getData('customers');
            const customer = customers.find(c => c.id === bill.customerId);
            const customerName = customer ? customer.name : 'Unknown';
            
            const printHTML = `
                <h2>Water Billing Receipt</h2>
                <div class="divider"></div>
                <table>
                    <tr><td>Customer:</td><td><strong>${customerName}</strong></td></tr>
                    <tr><td>Date:</td><td>${new Date(bill.date).toLocaleDateString()}</td></tr>
                </table>
                <div class="divider"></div>
                <table>
                    <tr><td>Previous Reading:</td><td>${bill.prevReading} m³</td></tr>
                    <tr><td>Present Reading:</td><td>${bill.presReading} m³</td></tr>
                    <tr><td>Usage:</td><td><strong>${bill.totalUsed} m³</strong></td></tr>
                </table>
                <div class="divider"></div>
                <table>
                    <tr><td>Rate:</td><td>${formatMoney(bill.pricePerCubic)}/m³</td></tr>
                    <tr><td>Subtotal:</td><td>${formatMoney(bill.totalUsed * bill.pricePerCubic)}</td></tr>
                </table>
                <div class="total-row">Total Due: ${formatMoney(bill.totalDue)}</div>
                <div class="footer">Thank you for your payment</div>
            `;
            
            document.getElementById('printReceipt').innerHTML = printHTML;
            window.print();
        }

        function printBillById(billId) {
            const bills = getData('bills');
            const bill = bills.find(b => b.id === billId);
            if (bill) printBill(bill);
        }

        function deleteBill(billId) {
            if (!confirm('Delete this bill?')) return;
            const bills = getData('bills').filter(b => b.id !== billId);
            saveData('bills', bills);
            loadFilteredHistory();
        }

        // === STATS UPDATE ===
        function updateStats() {
            const customers = getData('customers');
            const bills = getData('bills');
            document.getElementById('totalCustomers').textContent = customers.length;
            document.getElementById('totalBills').textContent = bills.length;
        }

        // === EXCEL EXPORT ===
        function exportToExcel() {
            const bills = getData('bills');
            const customers = getData('customers');
            
            const data = bills.map(bill => {
                const customer = customers.find(c => c.id === bill.customerId);
                return {
                    'Customer': customer ? customer.name : 'Unknown',
                    'Date': new Date(bill.date).toLocaleDateString(),
                    'Prev Reading': bill.prevReading,
                    'Pres Reading': bill.presReading,
                    'Usage (m³)': bill.totalUsed,
                    'Rate/m³': bill.pricePerCubic,
                    'Total Due': bill.totalDue
                };
            });
            
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Bills');
            XLSX.writeFile(wb, 'water-billing.xlsx');
        }

        // === INITIALIZATION ===
        document.addEventListener('DOMContentLoaded', function() {
            applyThemeFromSession();
            updateStats();
            
            // Check if already logged in
            const sess = getSession();
            if (sess.loggedIn) {
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('appSection').style.display = 'block';
                loadCustomersList();
                updateCurrencyDisplay();
            }
        });
