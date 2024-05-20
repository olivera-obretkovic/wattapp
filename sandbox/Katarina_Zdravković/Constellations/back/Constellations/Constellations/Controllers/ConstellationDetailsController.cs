using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Constellations.Models;

namespace Constellations.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConstellationDetailsController : ControllerBase
    {
        private readonly ConstellationDetailsContext _context;

        public ConstellationDetailsController(ConstellationDetailsContext context)
        {
            _context = context;
        }

        // GET: api/ConstellationDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConstellationDetails>>> GetConstellationDetail()
        {
            return await _context.ConstellationDetail.ToListAsync();
        }

        // GET: api/ConstellationDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ConstellationDetails>> GetConstellationDetails(int id)
        {
            var constellationDetails = await _context.ConstellationDetail.FindAsync(id);

            if (constellationDetails == null)
            {
                return NotFound();
            }

            return constellationDetails;
        }

        // PUT: api/ConstellationDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutConstellationDetails(int id, ConstellationDetails constellationDetails)
        {
            if (id != constellationDetails.ConstellationDetailsID)
            {
                return BadRequest();
            }

            _context.Entry(constellationDetails).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConstellationDetailsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/ConstellationDetails
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ConstellationDetails>> PostConstellationDetails(ConstellationDetails constellationDetails)
        {
            _context.ConstellationDetail.Add(constellationDetails);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetConstellationDetails", new { id = constellationDetails.ConstellationDetailsID }, constellationDetails);
        }

        // DELETE: api/ConstellationDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConstellationDetails(int id)
        {
            var constellationDetails = await _context.ConstellationDetail.FindAsync(id);
            if (constellationDetails == null)
            {
                return NotFound();
            }

            _context.ConstellationDetail.Remove(constellationDetails);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ConstellationDetailsExists(int id)
        {
            return _context.ConstellationDetail.Any(e => e.ConstellationDetailsID == id);
        }
    }
}
